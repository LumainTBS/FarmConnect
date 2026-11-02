import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  supabase, 
  INITIAL_SEASONAL_TIPS,
  SUBSCRIPTION_TIERS,
  calculateOrderCommission,
  isValidUUID,
  generateUUID
} from '../lib/supabase';

// Helper function to check if a listing belongs to the currently logged in farmer
export const isFarmerListing = (listing, user) => {
  if (!user || !listing) return false;
  if (user.farmer_id && listing.farmer_id === user.farmer_id) return true;
  if (user.id && listing.farmer_id === user.id) return true;
  if (user.email && listing.farmer_email && user.email.toLowerCase() === listing.farmer_email.toLowerCase()) return true;
  if (user.full_name && listing.farmer_name && user.full_name.toLowerCase() === listing.farmer_name.toLowerCase()) return true;
  return false;
};

// Helper function to check if an order belongs to the currently logged in farmer
export const isFarmerOrder = (order, user) => {
  if (!user || !order) return false;
  if (user.farmer_id && order.farmer_id === user.farmer_id) return true;
  if (user.id && order.farmer_id === user.id) return true;
  if (user.email && order.farmer_email && user.email.toLowerCase() === order.farmer_email.toLowerCase()) return true;
  if (user.full_name && order.farmer_name && user.full_name.toLowerCase() === order.farmer_name.toLowerCase()) return true;
  return false;
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication & Session Loading State (Strict session check prevents cross-account leak)
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Helper to fetch/sync user profile from public.users table
  const syncUserProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      localStorage.removeItem('farmconnect_user');
      setAuthLoading(false);
      return null;
    }

    try {
      // 1. Fetch existing profile from public.users
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const meta = authUser.user_metadata || {};
      const fallbackName = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'User';
      const fallbackAvatar = meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80';
      const fallbackRole = meta.role || profile?.role || 'farmer';

      let synced = null;

      if (profile) {
        // If profile has generic avatar or no avatar, sync real Google avatar
        const updates = {};
        if ((!profile.profile_picture_url || profile.profile_picture_url.includes('unsplash.com')) && (meta.avatar_url || meta.picture)) {
          updates.profile_picture_url = meta.avatar_url || meta.picture;
        }
        if (!profile.full_name && (meta.full_name || meta.name)) {
          updates.full_name = meta.full_name || meta.name;
        }
        if (Object.keys(updates).length > 0) {
          try {
            await supabase.from('users').update(updates).eq('id', authUser.id);
          } catch (e) {
            console.warn('Profile update notice:', e);
          }
        }

        synced = {
          id: authUser.id,
          farmer_id: authUser.id,
          email: authUser.email,
          full_name: updates.full_name || profile.full_name || fallbackName,
          role: profile.role || fallbackRole,
          phone_number: profile.phone_number || '',
          profile_picture_url: updates.profile_picture_url || profile.profile_picture_url || fallbackAvatar,
          id_document_url: profile.id_document_url || null,
          is_verified: profile.is_verified ?? false,
          verification_status: profile.verification_status || (profile.is_verified ? 'approved' : 'pending'),
          settlement_type: profile.settlement_type || meta.settlement_type || 'rural',
          inkhundla: profile.inkhundla || meta.inkhundla || '',
          street_address: profile.street_address || '',
          subscription_tier: profile.subscription_tier || meta.subscription_tier || 'free',
          location: profile.street_address 
            ? `${profile.street_address}, ${profile.inkhundla || ''}` 
            : (profile.inkhundla ? `${profile.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini')
        };
      } else {
        // If no row in public.users yet, create one
        synced = {
          id: authUser.id,
          farmer_id: authUser.id,
          email: authUser.email,
          full_name: fallbackName,
          role: fallbackRole,
          phone_number: '',
          profile_picture_url: fallbackAvatar,
          id_document_url: null,
          is_verified: false,
          verification_status: 'pending',
          settlement_type: meta.settlement_type || 'rural',
          inkhundla: meta.inkhundla || '',
          street_address: '',
          subscription_tier: meta.subscription_tier || 'free',
          location: meta.inkhundla ? `${meta.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini'
        };

        await supabase.from('users').upsert({
          id: synced.id,
          email: synced.email,
          full_name: synced.full_name,
          role: synced.role,
          profile_picture_url: synced.profile_picture_url,
          is_verified: synced.is_verified,
          verification_status: synced.verification_status,
          settlement_type: synced.settlement_type,
          inkhundla: synced.inkhundla,
          subscription_tier: synced.subscription_tier
        });
      }

      setUser(synced);
      localStorage.setItem('farmconnect_user', JSON.stringify(synced));
      return synced;
    } catch (err) {
      console.error('Error syncing user profile:', err);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  // Listings state (Pure real database listings)
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('farmconnect_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(l => l && !String(l.id).startsWith('lst-')) : [];
      }
    } catch (e) {
      console.warn('Listing cache read error:', e);
    }
    return [];
  });

  // Farmers state (Real registered users with role=farmer from public.users)
  const [farmers, setFarmers] = useState(() => {
    try {
      const saved = localStorage.getItem('farmconnect_farmers');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(f => f && !String(f.id).startsWith('frm-')) : [];
      }
    } catch (e) {
      console.warn('Farmers cache read error:', e);
    }
    return [];
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('farmconnect_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders state (Real user orders)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('farmconnect_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(o => o && o.id !== 'FC00123' && o.farmer_id !== 'frm-1') : [];
      }
    } catch (e) {
      console.warn('Orders cache read error:', e);
    }
    return [];
  });

  // Messages state with safe hydration (Real user conversations)
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('farmconnect_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(m => m && typeof m === 'object' && m.id !== 'msg-1' && m.id !== 'msg-2' && m.conversation_with_id !== 'frm-1' && m.conversation_with_id !== 'frm-2').map(m => ({
            ...m,
            chats: Array.isArray(m.chats) ? m.chats : (m.content ? [{ sender: 'buyer', text: m.content, time: 'Recent' }] : [])
          }));
        }
      } catch (e) {
        console.warn('Error reading saved messages:', e);
      }
    }
    return [];
  });

  // Plant Logs (Real farmer crop logs)
  const [plantLogs, setPlantLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('farmconnect_plantlogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(p => p && p.id !== 'pl-1') : [];
      }
    } catch (e) {
      console.warn('Plant logs cache read error:', e);
    }
    return [];
  });

  // Restock Notification Tracking
  const [restockAttempts, setRestockAttempts] = useState(() => {
    const saved = localStorage.getItem('farmconnect_restock_attempts');
    return saved ? JSON.parse(saved) : {};
  });

  // Farmer Restock Alerts
  const [restockAlerts, setRestockAlerts] = useState(() => {
    const saved = localStorage.getItem('farmconnect_restock_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Subscription Payments Ledger (Real payments)
  const [subscriptionPayments, setSubscriptionPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('farmconnect_subscription_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(s => s && !String(s.id).startsWith('SUB-2026-')) : [];
      }
    } catch (e) {
      console.warn('Subscription payments cache read error:', e);
    }
    return [];
  });

  // Real Database Fetching & Sync Functions
  const fetchSupabaseListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setListings(data);
      }
    } catch (e) {
      console.warn('Listing fetch notice:', e);
    }
  };

  const deployAllListingsToSupabase = async () => {
    try {
      const formattedListings = listings.map(l => {
        const payload = {
          ...l,
          id: isValidUUID(l.id) ? l.id : generateUUID(),
          farmer_id: isValidUUID(l.farmer_id) ? l.farmer_id : null
        };
        return payload;
      });

      const { data, error } = await supabase.from('listings').upsert(formattedListings, { onConflict: 'id' }).select();
      if (error) {
        console.warn('Deploy listings to Supabase notice:', error.message);
        return { success: false, error: error.message };
      } else {
        if (data && data.length > 0) {
          setListings(data);
        }
        showToast('All produce listings successfully deployed to Supabase!');
        return { success: true, count: data ? data.length : 0 };
      }
    } catch (e) {
      console.warn('Deploy error:', e);
      return { success: false, error: e.message };
    }
  };

  const fetchSupabaseFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'farmer');

      if (!error && data && data.length > 0) {
        const formatted = data.map(u => ({
          id: u.id,
          name: u.full_name || 'Local Farmer',
          avatar: u.profile_picture_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
          cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          location: u.street_address ? `${u.street_address}, ${u.inkhundla || ''}` : (u.inkhundla ? `${u.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini'),
          inkhundla: u.inkhundla || '',
          settlement_type: u.settlement_type || 'rural',
          is_verified: u.is_verified || false,
          verification_status: u.verification_status || (u.is_verified ? 'approved' : 'pending'),
          id_document_url: u.id_document_url || null,
          subscription_tier: u.subscription_tier || 'free',
          about: 'Registered agricultural producer on Farm Connect Eswatini.',
          tags: ['Registered Farmer', 'Local Produce'],
          rating: 5.0,
          reviews_count: 0,
          goods_sold: 0,
          response_rate: 100,
          phone: u.phone_number || '',
          email: u.email || '',
          created_at: u.created_at || new Date().toISOString()
        }));

        setFarmers(formatted);
      }
    } catch (e) {
      console.warn('Farmer fetch notice:', e);
    }
  };

  // Supabase Auth listener & Session Lifecycle
  useEffect(() => {
    // Helper to clean OAuth tokens from address bar
    const cleanUrlHash = () => {
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
        window.history.replaceState(null, '', window.location.pathname || '/');
      }
    };

    // 1. Initial session check (Strict: only activate user if verified Supabase session exists)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserProfile(session.user);
        if (window.location.hash && window.location.hash.includes('access_token')) {
          cleanUrlHash();
          showToast(`Welcome back, ${session.user.user_metadata?.full_name || 'Farmer'}!`, 'success');
        }
      } else {
        setUser(null);
        localStorage.removeItem('farmconnect_user');
        setAuthLoading(false);
      }
    }).catch(() => {
      setUser(null);
      localStorage.removeItem('farmconnect_user');
      setAuthLoading(false);
    });

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncUserProfile(session.user);
        cleanUrlHash();
        if (event === 'SIGNED_IN') {
          showToast(`Welcome, ${session.user.user_metadata?.full_name || session.user.email || 'User'}!`, 'success');
        }
      } else {
        setUser(null);
        localStorage.removeItem('farmconnect_user');
        setAuthLoading(false);
      }
    });

    // 3. Fetch initial database records
    fetchSupabaseListings();
    fetchSupabaseFarmers();

    return () => subscription.unsubscribe();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('farmconnect_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('farmconnect_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('farmconnect_farmers', JSON.stringify(farmers));
  }, [farmers]);

  useEffect(() => {
    localStorage.setItem('farmconnect_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('farmconnect_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('farmconnect_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('farmconnect_plantlogs', JSON.stringify(plantLogs));
  }, [plantLogs]);

  useEffect(() => {
    localStorage.setItem('farmconnect_restock_attempts', JSON.stringify(restockAttempts));
  }, [restockAttempts]);

  useEffect(() => {
    localStorage.setItem('farmconnect_restock_alerts', JSON.stringify(restockAlerts));
  }, [restockAlerts]);

  // Auth functions
  const loginUser = (userData) => {
    const updatedUser = {
      ...userData,
      farmer_id: userData.farmer_id || (userData.role === 'farmer' ? userData.id : undefined)
    };
    setUser(updatedUser);
    localStorage.setItem('farmconnect_user', JSON.stringify(updatedUser));
    showToast(`Welcome back, ${updatedUser.full_name}!`);
  };

  const registerUser = (userData) => {
    const updatedUser = {
      ...userData,
      farmer_id: userData.farmer_id || (userData.role === 'farmer' ? userData.id : undefined)
    };
    setUser(updatedUser);
    localStorage.setItem('farmconnect_user', JSON.stringify(updatedUser));
    showToast(`Account registered as ${updatedUser.role.toUpperCase()}!`);
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('farmconnect_user');
    showToast('Logged out successfully', 'info');
  };

  const switchRole = async (newRole) => {
    if (!user) return;
    const updated = {
      ...user,
      role: newRole,
      farmer_id: newRole === 'farmer' ? user.id : undefined,
      farmer_name: newRole === 'farmer' ? (user.full_name || 'My Farm') : undefined
    };
    setUser(updated);
    localStorage.setItem('farmconnect_user', JSON.stringify(updated));

    // Update in Supabase
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', user.id);
    } catch (e) {
      console.warn('Role update notice:', e);
    }
    showToast(`Switched view to ${newRole.toUpperCase()} Mode`, 'info');
  };

  const updateUserProfile = async (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('farmconnect_user', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('users').update(updatedFields).eq('id', user.id);
      if (error) {
        console.warn('Supabase profile update notice:', error.message);
      }
    } catch (e) {
      console.warn('Profile update notice:', e);
    }
    showToast('Profile updated successfully!');
  };

  // Cart functions with Auth check and STRICT STOCK VALIDATION
  const addToCart = (listing, qty = 1) => {
    if (!user) {
      showToast('Please log in or register to buy products', 'info');
      return false;
    }

    const availableStock = Number(listing.quantity) || 0;
    const isOutOfStock = availableStock <= 0 || listing.status === 'sold_out' || listing.status === 'out_of_stock';

    if (isOutOfStock) {
      showToast(`"${listing.product_type}" is currently out of stock. Cannot add to cart.`, 'error');
      return false;
    }

    // Check how many are currently in cart
    const existing = cart.find(item => item.id === listing.id);
    const currentInCart = existing ? existing.quantity : 0;

    if (currentInCart >= availableStock) {
      showToast(`Only ${availableStock} in stock. You already have all available items in your cart!`, 'error');
      return false;
    }

    // Calculate how many more can be added
    const allowedToAdd = Math.min(qty, availableStock - currentInCart);
    if (allowedToAdd <= 0) {
      showToast(`Cannot add more than ${availableStock} ${listing.unit || 'units'} available in stock.`, 'error');
      return false;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === listing.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === listing.id
            ? { ...item, quantity: item.quantity + allowedToAdd }
            : item
        );
      }
      return [...prevCart, { ...listing, quantity: allowedToAdd }];
    });

    showToast(`Added ${listing.product_type} to cart (${currentInCart + allowedToAdd}/${availableStock} in stock)`);
    return true;
  };

  const removeFromCart = (listingId) => {
    setCart(prev => prev.filter(item => item.id !== listingId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (listingId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(listingId);
      return;
    }

    const listing = listings.find(l => l.id === listingId);
    const availableStock = listing ? (Number(listing.quantity) || 0) : 999;

    if (newQty > availableStock) {
      showToast(`Only ${availableStock} available in stock`, 'error');
      return;
    }

    setCart(prev => prev.map(item =>
      item.id === listingId ? { ...item, quantity: newQty } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  // REAL SUPABASE LISTING CRUD
  const addListing = async (newListingData) => {
    if (!user) {
      showToast('Please sign in to list your produce', 'error');
      return null;
    }

    const newId = generateUUID();
    const validFarmerId = (user.id && isValidUUID(user.id)) 
      ? user.id 
      : ((user.farmer_id && isValidUUID(user.farmer_id)) ? user.farmer_id : null);

    const listingPayload = {
      id: newId,
      farmer_name: user.full_name || 'My Farm',
      farmer_email: user.email || '',
      farmer_avatar: user.profile_picture_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
      status: 'available',
      is_verified: user.is_verified || false,
      created_at: new Date().toISOString(),
      currency: 'E',
      rating: 5.0,
      reviews_count: 0,
      ...newListingData
    };

    if (validFarmerId) {
      listingPayload.farmer_id = validFarmerId;
    }

    // Optimistically update listings locally
    setListings(prev => [listingPayload, ...prev]);

    // Persist in Supabase
    try {
      const { data, error } = await supabase.from('listings').insert(listingPayload).select().maybeSingle();
      if (error) {
        console.warn('Supabase listing insert notice:', error.message);
      } else if (data) {
        setListings(prev => prev.map(l => l.id === listingPayload.id ? data : l));
      }
    } catch (err) {
      console.warn('Listing insert notice:', err);
    }

    showToast('Product listing published successfully!');
    return listingPayload;
  };

  const deleteListing = async (listingId) => {
    // Optimistically remove from state
    setListings(prev => prev.filter(item => item.id !== listingId));

    try {
      const { error } = await supabase.from('listings').delete().eq('id', listingId);
      if (error) {
        console.warn('Supabase delete listing notice:', error.message);
      }
    } catch (err) {
      console.warn('Delete listing notice:', err);
    }
    showToast('Listing removed successfully', 'info');
  };

  const updateListingStatus = async (listingId, newStatus) => {
    setListings(prev => prev.map(item =>
      item.id === listingId ? { ...item, status: newStatus } : item
    ));

    try {
      await supabase.from('listings').update({ status: newStatus }).eq('id', listingId);
    } catch (e) {
      console.warn('Status update notice:', e);
    }
    showToast(`Listing status updated to ${newStatus}`);
  };

  const updateListingDetails = async (listingId, updatedFields) => {
    // If quantity is updated to > 0, reset restock attempts and clear alert
    if (updatedFields.quantity && Number(updatedFields.quantity) > 0) {
      updatedFields.status = 'available';
      setRestockAttempts(prev => {
        const next = { ...prev };
        delete next[listingId];
        return next;
      });
      setRestockAlerts(prev => prev.filter(a => a.listing_id !== listingId));
    }

    setListings(prev => prev.map(item =>
      item.id === listingId ? { ...item, ...updatedFields } : item
    ));

    try {
      await supabase.from('listings').update(updatedFields).eq('id', listingId);
    } catch (e) {
      console.warn('Details update notice:', e);
    }
    showToast('Listing updated successfully!');
  };

  // Place Order with Real-time Stock Deduction & Commission Tracking
  const createOrder = async (orderItems, paymentMethod) => {
    const newOrders = orderItems.map(item => {
      const farmerObj = farmers.find(f => f.id === item.farmer_id || f.id === item.farmerId);
      const farmerTier = farmerObj?.subscription_tier || 'free';
      const commissionCalc = calculateOrderCommission(item.price * item.quantity, farmerTier);

      return {
        id: `FC00${Math.floor(100 + Math.random() * 900)}`,
        listing_id: item.id,
        product_name: item.product_type,
        farmer_name: item.farmer_name,
        farmer_id: item.farmer_id,
        farmer_email: item.farmer_email || '',
        farmer_tier: farmerTier,
        buyer_id: user ? user.id : null,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        commission_rate: commissionCalc.rate,
        commission_percent: commissionCalc.ratePercent,
        commission_amount: commissionCalc.commissionAmount,
        farmer_payout: commissionCalc.farmerPayout,
        delivery_fee: 10,
        order_status: 'pending',
        payment_status: 'paid',
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        rated: false,
        image_url: item.images ? item.images[0] : ''
      };
    });

    setOrders(prev => [...newOrders, ...prev]);
    clearCart();

    // 1. Real-time Inventory Stock Deduction from Listings
    const updatedStockEntries = [];
    setListings(prevListings => {
      return prevListings.map(listing => {
        const orderedItem = orderItems.find(oi => oi.id === listing.id);
        if (orderedItem) {
          const currentQty = Number(listing.quantity) || 0;
          const purchasedQty = Number(orderedItem.quantity) || 0;
          const remainingQty = Math.max(0, currentQty - purchasedQty);
          const newStatus = remainingQty === 0 ? 'sold_out' : listing.status;
          updatedStockEntries.push({ id: listing.id, quantity: remainingQty, status: newStatus });
          return {
            ...listing,
            quantity: remainingQty,
            status: newStatus
          };
        }
        return listing;
      });
    });

    // 2. Increment Farmers' Verified Goods Sold count
    setFarmers(prevFarmers => {
      return prevFarmers.map(f => {
        const farmerOrders = orderItems.filter(oi => oi.farmer_id === f.id || oi.farmerId === f.id);
        if (farmerOrders.length > 0) {
          const totalUnitsSold = farmerOrders.reduce((sum, oi) => sum + (Number(oi.quantity) || 1), 0);
          return {
            ...f,
            goods_sold: (f.goods_sold || 0) + totalUnitsSold
          };
        }
        return f;
      });
    });

    // 3. Persist order & updated inventory in Supabase
    try {
      await supabase.from('orders').insert(newOrders);
    } catch (e) {
      console.warn('Order insert notice:', e);
    }

    for (const update of updatedStockEntries) {
      try {
        await supabase
          .from('listings')
          .update({ quantity: update.quantity, status: update.status })
          .eq('id', update.id);
      } catch (err) {
        console.warn('Listing stock update notice:', err);
      }
    }

    showToast('Order confirmed successfully!');
    return newOrders;
  };

  // Notify Farmer to Restock Sold Out Produce (Max 2 attempts overall)
  const notifyFarmerToRestock = async (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return { success: false, attempts: 0 };

    const currentAttempts = restockAttempts[listingId] || 0;
    if (currentAttempts >= 2) {
      showToast(`Farmer ${listing.farmer_name} has already received 2 restock notifications for "${listing.product_type}". Please wait for the farmer to update stock.`, 'info');
      return { success: false, attempts: 2 };
    }

    const newAttempts = currentAttempts + 1;
    setRestockAttempts(prev => ({ ...prev, [listingId]: newAttempts }));

    // Create restock alert for Farmer Command Center and notification badge
    const alertId = `ALERT-${Date.now()}`;
    const newAlert = {
      id: alertId,
      listing_id: listing.id,
      product_name: listing.product_type,
      farmer_id: listing.farmer_id,
      farmer_name: listing.farmer_name,
      buyer_id: user?.id || 'guest-buyer',
      buyer_name: user?.full_name || 'Interested Buyer',
      created_at: new Date().toISOString(),
      attempt: newAttempts,
      is_read: false
    };

    setRestockAlerts(prev => [newAlert, ...prev]);

    // Send direct restock notification message safely grouped into conversation
    const restockChatText = `[Restock Request #${newAttempts}/2]: A buyer is asking to purchase "${listing.product_type}" which is out of stock. When will your next crates be ready?`;
    
    setMessages(prev => {
      const safePrev = Array.isArray(prev) ? prev.filter(c => c && typeof c === 'object') : [];
      const targetId = listing.farmer_id;
      const existingIdx = safePrev.findIndex(c => c.conversation_with_id === targetId);
      const newChat = {
        sender: 'buyer',
        sender_id: user?.id || null,
        sender_name: user?.full_name || 'Interested Buyer',
        text: restockChatText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (existingIdx > -1) {
        const copy = [...safePrev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          last_message: newChat.text,
          last_time: 'Just now',
          product_context: {
            product_name: listing.product_type,
            price: listing.price,
            unit: listing.unit
          },
          chats: [...(copy[existingIdx].chats || []), newChat]
        };
        return copy;
      }
      return [
        {
          id: `msg-${Date.now()}`,
          conversation_with_id: targetId,
          conversation_with_name: listing.farmer_name || 'Farmer',
          farmer_avatar: listing.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
          last_message: newChat.text,
          last_time: 'Just now',
          unread: false,
          product_context: {
            product_name: listing.product_type,
            price: listing.price,
            unit: listing.unit
          },
          chats: [newChat]
        },
        ...safePrev
      ];
    });

    try {
      await supabase.from('messages').insert({
        id: generateUUID(),
        sender_id: (user?.id && isValidUUID(user.id)) ? user.id : null,
        sender_name: user?.full_name || 'Interested Buyer',
        receiver_id: (listing.farmer_id && isValidUUID(listing.farmer_id)) ? listing.farmer_id : null,
        receiver_name: listing.farmer_name,
        product_name: listing.product_type,
        listing_id: listing.id,
        content: restockChatText
      });
    } catch (e) {
      console.warn('Restock message sync notice:', e);
    }

    showToast(`Restock alert sent to ${listing.farmer_name}! (${newAttempts}/2 alerts sent)`, 'success');
    return { success: true, attempts: newAttempts };
  };

  const dismissRestockAlert = (alertId) => {
    setRestockAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const markRestockAlertAsRead = (alertId) => {
    setRestockAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, order_status: newStatus } : o
    ));

    try {
      await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId);
    } catch (e) {
      console.warn('Order status notice:', e);
    }
    showToast(`Order status updated to ${newStatus.toUpperCase()}`);
  };

  const rateOrderFarmer = async (orderId, rating, comment) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, rated: true, user_rating: rating } : o
    ));

    try {
      const order = orders.find(o => o.id === orderId);
      if (order && user) {
        await supabase.from('reviews').insert({
          farmer_id: order.farmer_id,
          listing_id: order.listing_id,
          reviewer_id: user.id,
          reviewer_name: user.full_name,
          rating,
          comment
        });
      }
    } catch (e) {
      console.warn('Review insert notice:', e);
    }
    showToast('Thank you for rating your farmer!');
  };

  // Subscription Upgrade
  const upgradeSubscription = async (tierId, paymentDetails = {}) => {
    if (!user) {
      showToast('Please sign in to upgrade your subscription', 'error');
      return false;
    }

    const tier = SUBSCRIPTION_TIERS[tierId];
    if (!tier) return false;

    const newPayment = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      farmer_id: user.id,
      farmer_name: user.full_name,
      farmer_email: user.email,
      tier_id: tierId,
      tier_name: tier.name,
      amount: tier.price,
      currency: 'SZL (E)',
      payment_method: paymentDetails.paymentMethod || 'MTN Mobile Money (MoMo)',
      momo_number: paymentDetails.momoNumber || '+268 7600 0000',
      status: 'completed',
      created_at: new Date().toISOString()
    };

    setSubscriptionPayments(prev => [newPayment, ...prev]);
    localStorage.setItem('farmconnect_subscription_payments', JSON.stringify([newPayment, ...subscriptionPayments]));

    const updatedUser = { ...user, subscription_tier: tierId };
    setUser(updatedUser);
    localStorage.setItem('farmconnect_user', JSON.stringify(updatedUser));

    // Also update in farmers list
    setFarmers(prev => prev.map(f => f.id === user.id ? { ...f, subscription_tier: tierId } : f));

    try {
      await supabase.from('users').update({ subscription_tier: tierId }).eq('id', user.id);
    } catch (e) {
      console.warn('Subscription DB update notice:', e);
    }

    showToast(`🎉 Subscribed to ${tier.name}! Listing capacity increased to ${tier.maxListings}.`, 'success');
    return true;
  };

  // Admin Verification & Tier Management
  const adminApproveFarmer = async (farmerId) => {
    setFarmers(prev => prev.map(f =>
      f.id === farmerId ? { ...f, is_verified: true, verification_status: 'approved' } : f
    ));

    if (user && user.id === farmerId) {
      const updated = { ...user, is_verified: true, verification_status: 'approved' };
      setUser(updated);
      localStorage.setItem('farmconnect_user', JSON.stringify(updated));
    }

    try {
      await supabase.from('users').update({ is_verified: true, verification_status: 'approved' }).eq('id', farmerId);
    } catch (e) {
      console.warn('Admin approve notice:', e);
    }

    showToast('Farmer ID approved & verified successfully!', 'success');
  };

  const adminRejectFarmer = async (farmerId, reason = '') => {
    setFarmers(prev => prev.map(f =>
      f.id === farmerId ? { ...f, is_verified: false, verification_status: 'rejected' } : f
    ));

    if (user && user.id === farmerId) {
      const updated = { ...user, is_verified: false, verification_status: 'rejected' };
      setUser(updated);
      localStorage.setItem('farmconnect_user', JSON.stringify(updated));
    }

    try {
      await supabase.from('users').update({ is_verified: false, verification_status: 'rejected' }).eq('id', farmerId);
    } catch (e) {
      console.warn('Admin reject notice:', e);
    }

    showToast('Farmer verification status set to Rejected.', 'info');
  };

  const adminChangeFarmerTier = async (farmerId, newTier) => {
    setFarmers(prev => prev.map(f =>
      f.id === farmerId ? { ...f, subscription_tier: newTier } : f
    ));

    if (user && user.id === farmerId) {
      const updated = { ...user, subscription_tier: newTier };
      setUser(updated);
      localStorage.setItem('farmconnect_user', JSON.stringify(updated));
    }

    try {
      await supabase.from('users').update({ subscription_tier: newTier }).eq('id', farmerId);
    } catch (e) {
      console.warn('Admin tier update notice:', e);
    }

    showToast(`Farmer plan updated to ${SUBSCRIPTION_TIERS[newTier]?.name || newTier}.`, 'success');
  };

  // Messaging with Supabase Sync & Product Context
  const sendMessage = async (targetFarmerId, targetFarmerName, text, productContext = null) => {
    if (!user) {
      showToast('Please sign in to send messages', 'info');
      return false;
    }

    const isFarmer = user.role === 'farmer';
    const senderRole = isFarmer ? 'farmer' : 'buyer';
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => {
      const safePrev = Array.isArray(prev) ? prev.filter(c => c && typeof c === 'object') : [];
      const existingConvIndex = safePrev.findIndex(m => m.conversation_with_id === targetFarmerId);
      const newChat = { 
        sender: senderRole, 
        sender_id: user.id,
        sender_name: user.full_name || (isFarmer ? 'Farmer' : 'Buyer'),
        text, 
        time: timeNow 
      };

      if (existingConvIndex > -1) {
        const updated = [...safePrev];
        updated[existingConvIndex] = {
          ...updated[existingConvIndex],
          last_message: text,
          last_time: 'Just now',
          product_context: productContext || updated[existingConvIndex].product_context,
          chats: [...(updated[existingConvIndex].chats || []), newChat]
        };
        return updated;
      } else {
        const targetFarmer = farmers.find(f => f.id === targetFarmerId);
        const newConv = {
          id: `msg-${Date.now()}`,
          conversation_with_id: targetFarmerId,
          conversation_with_name: targetFarmerName,
          farmer_avatar: targetFarmer?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
          farmer_location: targetFarmer?.location || targetFarmer?.inkhundla || 'Eswatini',
          product_context: productContext || null,
          last_message: text,
          last_time: 'Just now',
          unread: false,
          chats: [newChat]
        };
        return [newConv, ...safePrev];
      }
    });

    try {
      await supabase.from('messages').insert({
        sender_id: (user?.id && isValidUUID(user.id)) ? user.id : null,
        sender_name: user.full_name || (isFarmer ? 'Farmer' : 'Buyer'),
        receiver_id: (targetFarmerId && isValidUUID(targetFarmerId)) ? targetFarmerId : null,
        receiver_name: targetFarmerName,
        product_name: productContext?.product_name || null,
        listing_id: productContext?.listing_id || null,
        content: text
      });
    } catch (e) {
      console.warn('Supabase message sync notice:', e);
    }

    showToast('Message sent to farmer', 'success');
    return true;
  };

  // Plant Log
  const addPlantLog = (logData) => {
    const newLog = {
      id: `pl-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...logData
    };
    setPlantLogs(prev => [newLog, ...prev]);
    showToast('Crop log entry saved');
  };

  const deletePlantLog = (logId) => {
    setPlantLogs(prev => prev.filter(l => l.id !== logId));
    showToast('Log entry removed', 'info');
  };

  return (
    <AppContext.Provider value={{
      user,
      authLoading,
      loginUser,
      registerUser,
      logoutUser,
      switchRole,
      updateUserProfile,
      listings,
      farmers,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      orders,
      createOrder,
      updateOrderStatus,
      rateOrderFarmer,
      subscriptionPayments,
      upgradeSubscription,
      adminApproveFarmer,
      adminRejectFarmer,
      adminChangeFarmerTier,
      messages,
      sendMessage,
      plantLogs,
      addPlantLog,
      deletePlantLog,
      addListing,
      deployAllListingsToSupabase,
      deleteListing,
      updateListingStatus,
      updateListingDetails,
      notifyFarmerToRestock,
      restockAttempts,
      restockAlerts,
      dismissRestockAlert,
      markRestockAlertAsRead,
      toast,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

