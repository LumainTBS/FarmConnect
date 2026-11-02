import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

// Real authenticated listings & farmers start fresh from Supabase
export const INITIAL_LISTINGS = [];

export const INITIAL_FARMERS = [];


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
