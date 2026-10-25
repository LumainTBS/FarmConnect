import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CheckCircle, ChevronRight, Heart, BellRing } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ listing, layout = 'grid' }) {
  const { addToCart, user, notifyFarmerToRestock } = useApp();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  if (!listing) return null;

  const isOutOfStock = (Number(listing.quantity) <= 0) || listing.status === 'sold_out' || listing.status === 'out_of_stock';

  const handleBuy = (e) => {
    e.preventDefault();
    if (isOutOfStock) {
      handleRestockNotify(e);
      return;
    }
    const success = addToCart(listing, 1);
    if (!success && !user) {
      navigate('/login');
    }
  };

  const handleRestockNotify = (e) => {
    e.preventDefault();
    e.stopPropagation();
    notifyFarmerToRestock(listing.id);
  };

  const handleCardClick = () => {
    if (isOutOfStock) {
      const next = clickCount + 1;
      setClickCount(next);
      if (next >= 2) {
        notifyFarmerToRestock(listing.id);
        setClickCount(0);
      }
    }
  };

  const imageSrc = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

  if (layout === 'row') {
    return (
      <div 
        onClick={handleCardClick}
        className={`rounded-xl border p-3 flex items-center gap-3.5 transition-all shadow-xs ${
          isOutOfStock 
            ? 'bg-slate-50/90 border-slate-300 opacity-70 grayscale' 
            : 'bg-white border-slate-200/80 hover:border-emerald-500'
        }`}
      >
        <Link to={`/listing/${listing.id}`} className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100 block">
          <img 
            src={imageSrc} 
            alt={listing.product_type} 
            className="w-full h-full object-cover" 
            loading="lazy"
          />
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-1">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider text-center">
                Out of Stock
              </span>
            </div>
          ) : listing.is_verified && (
            <div className="absolute top-1 left-1 bg-slate-900/90 text-emerald-400 p-1 rounded-md">
              <CheckCircle className="w-3 h-3" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 uppercase tracking-wide">
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
              {isOutOfStock ? (
                <button 
                  onClick={handleRestockNotify}
                  title="Notify farmer to restock"
                  className="bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 shadow-xs"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Restock Alert</span>
                </button>
              ) : (
                <button 
                  onClick={handleBuy}
                  className="bg-brand-forest text-white p-1.5 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-1 text-xs font-medium px-2.5 shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              )}
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
    <div 
      onClick={handleCardClick}
      className={`rounded-2xl border overflow-hidden shadow-xs flex flex-col h-full group transition-all duration-300 ${
        isOutOfStock 
          ? 'bg-slate-50/90 border-slate-300 opacity-70 grayscale' 
          : 'bg-white/90 backdrop-blur-xs border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md'
      }`}
    >
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

        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
            <button
              onClick={handleRestockNotify}
              className="mt-1.5 text-[10px] font-semibold text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
            >
              <BellRing className="w-3 h-3" />
              <span>Restock alert</span>
            </button>
          </div>
        ) : (
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 shadow-xs border border-white/60">
              {listing.category ? listing.category.charAt(0).toUpperCase() + listing.category.slice(1) : 'Produce'}
            </span>
          </div>
        )}

        <button 
          className="absolute top-2 right-2 bg-white/85 backdrop-blur-md p-1.5 rounded-lg text-slate-500 hover:text-rose-500 shadow-xs transition-colors border border-white/50"
          aria-label="Save product"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {listing.is_verified && !isOutOfStock && (
          <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Verified</span>
          </div>
        )}
      </div>

      {/* Product Details - Compact & Roomy */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link to={`/listing/${listing.id}`} className="block">
            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug hover:text-brand-forest transition-colors line-clamp-1">
              {listing.product_type}
            </h3>
          </Link>
          <div className="flex items-center text-[10px] sm:text-xs text-slate-500 gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{listing.farmer_name}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">{listing.inkhundla || listing.location || 'Eswatini'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 gap-1">
          <div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Price</div>
            <div className="text-sm sm:text-base font-bold text-brand-forest leading-none mt-0.5">
              E{listing.price}<span className="text-[10px] sm:text-xs text-slate-400 font-normal">/{listing.unit}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOutOfStock ? (
              <button
                onClick={handleRestockNotify}
                title="Send restock request to farmer"
                className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <BellRing className="w-3 h-3" />
                <span>Alert</span>
              </button>
            ) : (
              <button
                onClick={handleBuy}
                title="Add to cart"
                className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-brand-forest hover:bg-brand-dark text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
