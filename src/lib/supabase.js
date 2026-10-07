import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ctzrmplgvjssgycfsayg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0enJtcGxndmpzc2d5Y2ZzYXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzIwMDMsImV4cCI6MjEwNTgwODAwM30.CkrklvTOsg6xc79fKk8NHvzuz8jvVSG_deDpvVIYquI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// UUID Validation and Generation Helpers
export const isValidUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to check if a listing belongs to the currently logged in farmer
export const isFarmerListing = (listing, user) => {
  if (!user || !listing) return false;
  if (user.farmer_id && listing.farmer_id === user.farmer_id) return true;
  if (user.id && listing.farmer_id === user.id) return true;
  if (user.email && listing.farmer_email && user.email.toLowerCase() === listing.farmer_email.toLowerCase()) return true;
  if (user.full_name && listing.farmer_name && user.full_name.toLowerCase() === listing.farmer_name.toLowerCase()) return true;
  if ((!user.id && !user.farmer_id) || user.id === 'usr-farmer-demo' || user.farmer_id === 'frm-1') {
    return listing.farmer_id === 'frm-1';
  }
  return false;
};

// Helper function to check if an order belongs to the currently logged in farmer
export const isFarmerOrder = (order, user) => {
  if (!user || !order) return false;
  if (user.farmer_id && order.farmer_id === user.farmer_id) return true;
  if (user.id && order.farmer_id === user.id) return true;
  if (user.email && order.farmer_email && user.email.toLowerCase() === order.farmer_email.toLowerCase()) return true;
  if (user.full_name && order.farmer_name && user.full_name.toLowerCase() === order.farmer_name.toLowerCase()) return true;
  if ((!user.id && !user.farmer_id) || user.id === 'usr-farmer-demo' || user.farmer_id === 'frm-1') {
    return order.farmer_id === 'frm-1';
  }
  return false;
};

// Subscription Tiers Configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    priceLabel: 'Free',
    billingPeriod: 'Forever',
    maxListings: 3,
    commissionRate: 0.05, // 5%
    commissionPercent: 5,
    commissionLabel: '5.0%',
    marketTrendsAccess: false,
    badge: 'Starter',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Perfect for smallholder farmers testing the digital marketplace.',
    features: [
      'Up to 3 active produce listings',
      'Standard 5% platform transaction fee',
      'Direct buyer-farmer in-app messaging',
      'Basic SMS & in-app order notifications',
      'Private plant logs tracking'
    ],
    limitations: [
      'Market Trends & price forecasting locked',
      'Max 3 listings limit'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 50,
    priceLabel: 'E50',
    billingPeriod: '/month',
    maxListings: 10,
    commissionRate: 0.04, // 4%
    commissionPercent: 4,
    commissionLabel: '4.0%',
    marketTrendsAccess: false,
    badge: 'Basic Grower',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    popular: false,
    description: 'For growing family farms expanding their local distribution.',
    features: [
      'Up to 10 active produce listings',
      'Reduced 4% platform transaction fee',
      'Direct WhatsApp buyer ordering badge',
      'Priority customer support',
      'Private plant logs tracking'
    ],
    limitations: [
      'Market Trends & price forecasting locked'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 150,
    priceLabel: 'E150',
    billingPeriod: '/month',
    maxListings: 30,
    commissionRate: 0.025, // 2.5%
    commissionPercent: 2.5,
    commissionLabel: '2.5%',
    marketTrendsAccess: true,
    badge: 'Most Popular',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    popular: true,
    description: 'For commercial producers maximizing revenue and market intel.',
    features: [
      'Up to 30 active produce listings',
      'Full Market Trends & Price History unlocked',
      'Seasonal demand forecast & price fluctuation tips',
      'Low 2.5% platform transaction fee',
      'Verified Farmer priority search ranking',
      'Unlimited private plant logs'
    ],
    limitations: []
  },
  investor: {
    id: 'investor',
    name: 'Investor Plan',
    price: 350,
    priceLabel: 'E350',
    billingPeriod: '/month',
    maxListings: 9999,
    commissionRate: 0.01, // 1%
    commissionPercent: 1,
    commissionLabel: '1.0%',
    marketTrendsAccess: true,
    badge: 'VIP Enterprise',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    popular: false,
    description: 'For agricultural cooperatives, commercial estates & agri-investors.',
    features: [
      'Unlimited active produce listings',
      'Full Market Trends & Regional Agri-Analytics unlocked',
      'Lowest 1.0% platform transaction fee',
      'Featured Farm Connect Leaderboard placement',
      'Institutional bulk buyer connection priority',
      '24/7 dedicated account manager'
    ],
    limitations: []
  }
};

// Commission Helper
export const getCommissionRate = (tierId = 'free') => {
  const tier = SUBSCRIPTION_TIERS[tierId] || SUBSCRIPTION_TIERS.free;
  return tier.commissionRate;
};

export const calculateOrderCommission = (totalPrice, tierId = 'free') => {
  const rate = getCommissionRate(tierId);
  const amount = Math.round(Number(totalPrice) * rate * 100) / 100;
  return {
    rate,
    ratePercent: rate * 100,
    commissionAmount: amount,
    farmerPayout: Math.round((Number(totalPrice) - amount) * 100) / 100
  };
};

export const MANZINI_INKHUNDLA_LIST = [
  "Ekukhanyeni",
  "Hlambanyatsi",
  "Kwaluseni",
  "Lamgabhi",
  "Lobamba Lomdzala",
  "Ludzeludze",
  "Mafutseni",
  "Mahlangatja",
  "Mangcongco",
  "Manzini North",
  "Manzini South",
  "Mkhiweni",
  "Mtfongwaneni",
  "Ngwempisi",
  "Nhlambeni",
  "Ntondozi"
];

export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: 'Grid' },
  { id: 'vegetables', name: 'Vegetables', icon: 'Carrot', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'fruits', name: 'Fruits', icon: 'Apple', color: 'bg-amber-50 text-amber-700' },
  { id: 'grains', name: 'Grains & Cereals', icon: 'Wheat', color: 'bg-yellow-50 text-yellow-700' },
  { id: 'livestock', name: 'Livestock', icon: 'Beef', color: 'bg-red-50 text-red-700' },
  { id: 'poultry', name: 'Poultry', icon: 'Egg', color: 'bg-orange-50 text-orange-700' },
  { id: 'dairy', name: 'Dairy', icon: 'Milk', color: 'bg-blue-50 text-blue-700' },
  { id: 'processed', name: 'Processed Goods', icon: 'Package', color: 'bg-purple-50 text-purple-700' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: 'bg-slate-50 text-slate-700' }
];

// Initial realistic Eswatini agricultural seed listings
export const INITIAL_LISTINGS = [
  {
    id: 'lst-1',
    farmer_id: 'frm-1',
    farmer_name: 'Matsanjeni Farm',
    farmer_avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    product_type: 'Fresh Spinach',
    category: 'vegetables',
    description: 'Fresh, locally grown spinach harvest. Rich in nutrients and perfect for home cooking, local markets, or restaurants in Manzini and surrounding areas.',
    quantity: 120,
    unit: 'kg',
    price: 20,
    currency: 'E',
    harvest_date: '2026-09-22',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Matsanjeni Farm',
    location: 'Matsanjeni, Manzini Region',
    latitude: -26.5000,
    longitude: 31.3667,
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 24,
    created_at: '2026-09-20T08:00:00Z'
  },
  {
    id: 'lst-2',
    farmer_id: 'frm-2',
    farmer_name: 'Mahlase Farm',
    farmer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    product_type: 'Fresh Farm Tomatoes',
    category: 'vegetables',
    description: 'Juicy, vine-ripened red tomatoes harvested daily. Great for stewing, salad, and commercial food vendors. Picked at peak ripeness.',
    quantity: 350,
    unit: 'kg',
    price: 15,
    currency: 'E',
    harvest_date: '2026-09-23',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Manzini South',
    location: 'Manzini South, Eswatini',
    latitude: -26.4833,
    longitude: 31.3667,
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviews_count: 18,
    created_at: '2026-09-21T10:30:00Z'
  },
  {
    id: 'lst-3',
    farmer_id: 'frm-3',
    farmer_name: 'Piggs Peak Organic Cooperative',
    farmer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    product_type: 'Free Range Eggs',
    category: 'poultry',
    description: 'Fresh free-range jumbo eggs from grain-fed hens raised outdoors. Strong shells and rich yellow yolks.',
    quantity: 80,
    unit: 'dozen',
    price: 40,
    currency: 'E',
    harvest_date: '2026-09-24',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Piggs Peak',
    location: 'Piggs Peak, Hhohho Region',
    latitude: -25.9667,
    longitude: 31.2500,
    images: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    reviews_count: 42,
    created_at: '2026-09-22T07:15:00Z'
  },
  {
    id: 'lst-4',
    farmer_id: 'frm-4',
    farmer_name: 'Malkerns Valley Produce',
    farmer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    product_type: 'Yellow Maize (Green Corn)',
    category: 'grains',
    description: 'High grade sweet yellow maize ears ready for roasting or milling. Carefully tended in fertile Malkerns Valley soil.',
    quantity: 500,
    unit: 'kg',
    price: 12,
    currency: 'E',
    harvest_date: '2026-09-20',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Lobamba Lomdzala',
    location: 'Malkerns Farm, Manzini',
    latitude: -26.5500,
    longitude: 31.1833,
    images: [
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviews_count: 15,
    created_at: '2026-09-19T14:20:00Z'
  },
  {
    id: 'lst-5',
    farmer_id: 'frm-5',
    farmer_name: 'Mbabane Highland Cattle',
    farmer_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    product_type: 'Grass-fed Beef (Local)',
    category: 'livestock',
    description: 'Ethically raised grass-fed Eswatini cattle beef cuts. Inspected and fresh. Bulk orders for butchery or events welcome.',
    quantity: 150,
    unit: 'kg',
    price: 70,
    currency: 'E',
    harvest_date: '2026-09-24',
    status: 'available',
    is_verified: true,
    settlement_type: 'urban',
    street_address: 'Highland Ridge',
    location: 'Mbabane, Hhohho Region',
    latitude: -26.3167,
    longitude: 31.1333,
    images: [
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 31,
    created_at: '2026-09-23T11:00:00Z'
  },
  {
    id: 'lst-6',
    farmer_id: 'frm-1',
    farmer_name: 'Matsanjeni Farm',
    farmer_avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    product_type: 'Crisp Orange Carrots',
    category: 'vegetables',
    description: 'Sweet, crisp soil-grown carrots. Perfect for markets, soup mixes, and daily consumption.',
    quantity: 200,
    unit: 'kg',
    price: 10,
    currency: 'E',
    harvest_date: '2026-09-21',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Matsanjeni Farm',
    location: 'Manzini Farm, Eswatini',
    latitude: -26.5000,
    longitude: 31.3667,
    images: [
      'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 24,
    created_at: '2026-09-21T09:10:00Z'
  }
];

export const INITIAL_FARMERS = [
  {
    id: 'frm-1',
    name: 'Matsanjeni Farm',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: 'Manzini, Eswatini',
    inkhundla: 'Ludzeludze',
    is_verified: true,
    about: 'We are a family-run farm committed to providing fresh, high-quality produce to our local community. We focus on sustainable farming and supporting local food systems.',
    tags: ['Organic Farming', 'Local Delivery', 'Reliable Supply'],
    rating: 4.9,
    reviews_count: 24,
    goods_sold: 412,
    response_rate: 98,
    phone: '+268 7612 3456',
    email: 'matsanjeni@farmconnect.sz'
  },
  {
    id: 'frm-2',
    name: 'Mahlase Farm',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    location: 'Mbabane, Eswatini',
    inkhundla: 'Manzini South',
    is_verified: true,
    about: 'Specializing in open-field vegetables, tomatoes, green peppers, and leafy greens. Delivering consistency and freshness straight from our soil.',
    tags: ['Hydroponic Tech', 'Bulk Supply', 'Fast Dispatch'],
    rating: 4.8,
    reviews_count: 18,
    goods_sold: 285,
    response_rate: 95,
    phone: '+268 7678 9012',
    email: 'mahlase@farmconnect.sz'
  },
  {
    id: 'frm-3',
    name: 'Piggs Peak Organic Cooperative',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80',
    location: 'Piggs Peak, Hhohho',
    inkhundla: 'Piggs Peak',
    is_verified: true,
    about: 'Cooperative of 12 local smallholder poultry & produce farmers producing ethical free-range eggs, honey, and seasonal mountain vegetables.',
    tags: ['Cooperative', 'Free-Range', 'Certified Organic'],
    rating: 5.0,
    reviews_count: 42,
    goods_sold: 630,
    response_rate: 99,
    phone: '+268 7634 5678',
    email: 'piggspeak@farmconnect.sz'
  }
];

export const INITIAL_SEASONAL_TIPS = [
  {
    id: 'tip-1',
    product_type: 'Spinach',
    region: 'Manzini Region',
    month: 9, // September
    trend_direction: 'stable',
    tip_text: 'Spring planting window is active. Demand remains steady in urban markets. Irrigation management is recommended before rains peak.'
  },
  {
    id: 'tip-2',
    product_type: 'Maize',
    region: 'Malkerns Valley',
    month: 11, // November
    trend_direction: 'price_rising',
    tip_text: 'Entering dry winter transition when un-irrigated grain stock reduces. Early harvesters benefit from premium buyer contracts.'
  },
  {
    id: 'tip-3',
    product_type: 'Tomatoes',
    region: 'Hhohho',
    month: 9,
    trend_direction: 'price_falling',
    tip_text: 'Peak harvest season across lowveld farms creates supply surge. Consider grading and batch selling to supermarkets.'
  }
];
