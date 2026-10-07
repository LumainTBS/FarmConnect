import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, MessageSquare, MapPin, CheckCircle, Heart, ChevronLeft, 
  ChevronRight, ArrowLeft 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { listings, farmers, addToCart, sendMessage, user } = useApp();
  const navigate = useNavigate();

  const listing = listings.find(item => item.id === id);

  // Dynamically resolve seller from farmers or listing attributes
  const matchingFarmer = farmers.find(f => f.id === listing?.farmer_id || (listing?.farmer_name && f.name.toLowerCase() === listing.farmer_name.toLowerCase()));
  const farmer = matchingFarmer || {
    id: listing?.farmer_id || 'unknown',
    name: listing?.farmer_name || 'Local Eswatini Producer',
    avatar: listing?.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: listing?.location || (listing?.inkhundla ? `${listing.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini'),
    inkhundla: listing?.inkhundla || 'Ludzeludze',
    is_verified: listing?.is_verified ?? false,
    about: 'Local registered agricultural producer on Farm Connect Eswatini.',
    rating: listing?.rating || 5.0,
    reviews_count: listing?.reviews_count || 0,
    phone: '',
    email: listing?.farmer_email || ''
  };

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const images = listing?.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80'];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    const success = addToCart(listing, quantity);
    if (!success && !user) {
      navigate('/login');
    }
  };

  const handleContactFarmer = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const success = sendMessage(
      farmer.id,
      farmer.name,
      `Hello ${farmer.name}, I am interested in ordering ${quantity} ${listing.unit} of your ${listing.product_type} listed on Farm Connect.`
    );
    if (success) {
      navigate('/messages');
    }
  };

  if (!listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Produce Listing Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for may have been sold or removed.</p>
        <Link to="/marketplace" className="inline-block px-4 py-2 bg-brand-forest text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-colors">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      {/* Back Button */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: IMAGE CAROUSEL (Mobile Swipeable / Desktop Main View) */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img 
              src={images[activeImageIndex]} 
              alt={listing.product_type} 
              className="w-full h-full object-cover transition-all duration-300" 
            />

            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-slate-800 hover:bg-white shadow-md transition-colors"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-slate-800 hover:bg-white shadow-md transition-colors"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Favorite button */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-slate-600 hover:text-rose-500 shadow-md transition-colors"
              aria-label="Save product"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Status indicator */}
            <div className="absolute bottom-3 left-3 bg-emerald-950/80 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>In Stock • {listing.quantity} {listing.unit} available</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center space-x-2.5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-brand-forest shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: PRODUCT DETAILS & ACTIONS */}
        <div className="space-y-6">
          
          <div className="space-y-2 border-b border-slate-200/80 pb-5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 uppercase tracking-wide">
                {listing.category || 'Produce'}
              </span>
              {listing.is_verified && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-dark/90 text-emerald-300 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified Seller</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {listing.product_type}
            </h1>

            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">{listing.farmer_name}</span>
              <span>•</span>
              <span>{listing.inkhundla || listing.location || 'Manzini Region'}</span>
            </div>

            <div className="pt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-brand-forest">
                E{listing.price}
              </span>
              <span className="text-sm font-medium text-slate-500">
                per {listing.unit}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Quantity ({listing.unit})</label>
            <div className="inline-flex items-center border border-slate-300 rounded-xl bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 rounded-l-xl transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 rounded-r-xl transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons (Hybrid Buying Model) */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-xl bg-brand-forest text-white font-bold text-sm hover:bg-brand-dark transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart (E{listing.price * quantity})</span>
            </button>

            <button
              onClick={handleContactFarmer}
              className="w-full py-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-brand-forest" />
              <span>Contact Farmer Directly</span>
            </button>
          </div>

          {/* Seller Information Card */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Seller Information</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={farmer.avatar} 
                  alt={farmer.name} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200" 
                />
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center space-x-1">
                    <span>{farmer.name}</span>
                    {farmer.is_verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-xs text-slate-500">{farmer.location}</div>
                </div>
              </div>
              <Link
                to={`/farmer/${farmer.id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100"
              >
                View Profile
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
