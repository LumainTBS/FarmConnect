import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CheckCircle, ChevronRight, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ listing, layout = 'grid' }) {
  const { addToCart, user } = useApp();
  const navigate = useNavigate();

  if (!listing) return null;

  const handleBuy = (e) => {
    e.preventDefault();
    const success = addToCart(listing, 1);
    if (!success && !user) {
      navigate('/login');
    }
  };

  const imageSrc = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

  if (layout === 'row') {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-3.5 hover:border-emerald-500 transition-colors shadow-sm">
        <Link to={`/listing/${listing.id}`} className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
          <img 
            src={imageSrc} 
            alt={listing.product_type} 
            className="w-full h-full object-cover" 
            loading="lazy"
          />
          {listing.is_verified && (
            <div className="absolute top-1 left-1 bg-brand-dark/90 text-emerald-400 p-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 uppercase tracking-wide">
              {listing.category || 'Produce'}
            </span>
            <button className="text-slate-400 hover:text-rose-500 p-1" aria-label="Save listing">
              <Heart className="w-4 h-4" />
            </button>
          </div>

          <Link to={`/listing/${listing.id}`} className="block">
            <h3 className="font-semibold text-slate-900 text-sm truncate hover:text-brand-forest">
              {listing.product_type}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
            <span>{listing.farmer_name}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">{listing.inkhundla || listing.location || 'Manzini'}</span>
          </p>

          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <div className="font-bold text-brand-forest text-sm">
              E{listing.price}<span className="text-xs text-slate-500 font-normal">/{listing.unit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleBuy}
                className="bg-brand-forest text-white p-1.5 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-1 text-xs font-medium px-2.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
              <Link to={`/listing/${listing.id}`} className="text-slate-400 hover:text-slate-700 p-1">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Link to={`/listing/${listing.id}`} className="block w-full h-full">
          <img 
            src={imageSrc} 
            alt={listing.product_type} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            loading="lazy"
          />
        </Link>
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            {listing.category ? listing.category.charAt(0).toUpperCase() + listing.category.slice(1) : 'Agricultural'}
          </span>
        </div>
        <button 
          className="absolute top-2.5 right-2.5 bg-white/90 p-1.5 rounded-full text-slate-600 hover:text-rose-500 shadow-sm transition-colors"
          aria-label="Save product"
        >
          <Heart className="w-4 h-4" />
        </button>
        {listing.is_verified && (
          <div className="absolute bottom-2.5 left-2.5 bg-brand-dark/90 text-white text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Verified Seller</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <Link to={`/listing/${listing.id}`} className="block">
            <h3 className="font-semibold text-slate-900 text-base leading-snug hover:text-brand-forest transition-colors line-clamp-1">
              {listing.product_type}
            </h3>
          </Link>
          <div className="flex items-center text-xs text-slate-500 gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.farmer_name}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">{listing.inkhundla || listing.location || 'Manzini'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Price</div>
            <div className="text-lg font-bold text-brand-forest leading-none mt-0.5">
              E{listing.price}<span className="text-xs text-slate-500 font-normal">/{listing.unit}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to={`/listing/${listing.id}`}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Details
            </Link>
            <button
              onClick={handleBuy}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-brand-forest text-white hover:bg-brand-dark transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
