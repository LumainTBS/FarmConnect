import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, CheckCircle, Star, MessageSquare, ShieldCheck, 
  Truck, Award, ArrowLeft, Heart 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function FarmerProfilePage() {
  const { id } = useParams();
  const { farmers, listings, user, sendMessage } = useApp();
  const navigate = useNavigate();

  // 1. Check if the visited profile is the currently authenticated user
  const isCurrentUser = user && (id === user.id || id === user.farmer_id);
  
  // 2. Find from farmers list or construct from listings
  const foundFarmer = farmers.find(f => f.id === id);
  const sampleListing = listings.find(l => l.farmer_id === id);

  const farmer = isCurrentUser ? {
    id: user.id,
    name: user.full_name || 'My Farm',
    avatar: user.profile_picture_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: user.location || (user.inkhundla ? `${user.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini'),
    inkhundla: user.inkhundla || 'Ludzeludze',
    is_verified: user.is_verified || false,
    about: 'Local verified agricultural producer on Farm Connect Eswatini.',
    tags: ['Verified Farmer', 'Direct Farm Gate'],
    rating: 5.0,
    reviews_count: 0,
    goods_sold: 0,
    response_rate: 100,
    phone: user.phone_number || '',
    email: user.email || ''
  } : (foundFarmer || (sampleListing ? {
    id: sampleListing.farmer_id,
    name: sampleListing.farmer_name || 'Local Farmer',
    avatar: sampleListing.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: sampleListing.location || 'Manzini Region, Eswatini',
    inkhundla: sampleListing.inkhundla || 'Ludzeludze',
    is_verified: sampleListing.is_verified || false,
    about: 'Local producer on Farm Connect Eswatini.',
    tags: ['Local Producer'],
    rating: sampleListing.rating || 5.0,
    reviews_count: sampleListing.reviews_count || 0,
    goods_sold: 0,
    response_rate: 100,
    phone: '',
    email: sampleListing.farmer_email || ''
  } : farmers[0]));

  // Strictly filter listings belonging to this specific farmer
  const farmerListings = listings.filter(l => 
    l.farmer_id === farmer.id || 
    (farmer.name && l.farmer_name && l.farmer_name.toLowerCase() === farmer.name.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'products' | 'reviews'
  const [isFollowing, setIsFollowing] = useState(false);

  const handleContact = () => {
    sendMessage(farmer.id, farmer.name, `Hello ${farmer.name}, I found your farm profile on Farm Connect Eswatini...`);
    navigate('/messages');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-forest">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="h-36 sm:h-48 w-full relative bg-slate-100">
          <img src={farmer.cover} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="p-5 relative space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
            <div className="flex items-end space-x-3">
              <img 
                src={farmer.avatar} 
                alt={farmer.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md bg-white shrink-0" 
              />
              <div className="pt-2">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{farmer.name}</h1>
                  {farmer.is_verified && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{farmer.location}</span>
                  <span>•</span>
                  <span className="text-emerald-800 font-semibold">{farmer.inkhundla || 'Ludzeludze'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isFollowing
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-brand-forest text-white hover:bg-brand-dark'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleContact}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 flex items-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4 text-brand-forest" />
                <span>Contact</span>
              </button>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="flex border-b border-slate-200 pt-2 space-x-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'about' ? 'border-brand-forest text-brand-forest' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'products' ? 'border-brand-forest text-brand-forest' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Products ({farmerListings.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'reviews' ? 'border-brand-forest text-brand-forest' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Reviews ({farmer.reviews_count})
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'about' && (
            <div className="space-y-4 pt-2">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {farmer.about}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">Organic Farming</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                  <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">Local Delivery</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                  <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">Reliable Supply</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {farmerListings.map(listing => (
                <ProductCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{farmer.rating} out of 5 stars based on {farmer.reviews_count} verified buyer ratings</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Sibusiso Dlamini</span>
                    <span className="text-amber-500">★★★★★</span>
                  </div>
                  <p className="text-slate-600">The spinach was super fresh! Harvested the same morning. Very good communication.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Mandla Simelane</span>
                    <span className="text-amber-500">★★★★★</span>
                  </div>
                  <p className="text-slate-600">Prompt delivery to Manzini center. Will definitely order tomatoes again.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
