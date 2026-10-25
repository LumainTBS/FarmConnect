import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CheckCircle, ChevronRight, Heart, BellRing, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ listing, layout = 'grid', autoHide = false }) {
  const { addToCart, cart, user, notifyFarmerToRestock, restockAttempts } = useApp();
  const navigate = useNavigate();
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  const [countdown, setCountdown] = useState(5);

  if (!listing) return null;

  const availableStock = Number(listing.quantity) || 0;
  const isOutOfStock = availableStock <= 0 || listing.status === 'sold_out' || listing.status === 'out_of_stock';
  
  // Calculate quantity already in buyer's cart
  const inCartItem = cart?.find((item) => item.id === listing.id);
  const inCartQty = inCartItem ? inCartItem.quantity : 0;
  const isMaxInCart = !isOutOfStock && inCartQty >= availableStock;

  // Restock attempts (Max 2 overall)
  const attempts = (restockAttempts && restockAttempts[listing.id]) || 0;
  const maxAttemptsReached = attempts >= 2;

  // 5-second countdown to hide out of stock items
  useEffect(() => {
    if (isOutOfStock && autoHide) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerHidden(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsTimerHidden(false);
      setCountdown(5);
    }
  }, [isOutOfStock, autoHide]);

  if (isTimerHidden) {
    return null; // Automatically removed after 5 seconds
  }

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    if (isMaxInCart) {
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
    if (maxAttemptsReached) return;
    notifyFarmerToRestock(listing.id);
  };

  const imageSrc = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

  // LIST / ROW FORMAT
  if (layout === 'row' || layout === 'list') {
    return (
      <div 
        className={`rounded-2xl border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 shadow-xs ${
          isOutOfStock 
            ? 'bg-slate-50/90 border-slate-300/80 opacity-70 grayscale' 
            : 'bg-white/90 backdrop-blur-xs border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <Link to={`/listing/${listing.id}`} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 block group">
            <img 
              src={imageSrc} 
              alt={listing.product_type} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              loading="lazy"
            />
            {isOutOfStock ? (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider text-center">
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 uppercase tracking-wide">
                {listing.category || 'Produce'}
              </span>
              {isOutOfStock && autoHide && (
                <span className="text-[9px] font-medium text-rose-500 animate-pulse">
                  Hiding in {countdown}s
                </span>
              )}
            </div>

            <Link to={`/listing/${listing.id}`} className="block">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate hover:text-brand-forest">
                {listing.product_type}
              </h3>
            </Link>

            <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="font-medium text-slate-700">{listing.farmer_name}</span>
              <span className="text-slate-300">•</span>
              <span className="truncate">{listing.inkhundla || listing.location || 'Eswatini'}</span>
            </p>

            <div className="text-[11px] text-slate-500 mt-1">
              {isOutOfStock ? (
                <span className="text-rose-600 font-semibold">0 in stock</span>
              ) : (
                <span className="text-emerald-700 font-medium">{availableStock} {listing.unit} left</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action & Price */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-2 shrink-0">
          <div className="font-bold text-brand-forest text-base sm:text-lg">
            E{listing.price}<span className="text-xs text-slate-400 font-normal">/{listing.unit}</span>
          </div>

          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <button
                onClick={handleRestockNotify}
                disabled={maxAttemptsReached}
                title={maxAttemptsReached ? 'Maximum restock alerts sent (2/2)' : 'Notify farmer to restock'}
                className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  maxAttemptsReached 
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300' 
                    : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{maxAttemptsReached ? 'Alerted (2/2)' : `Restock Alert (${attempts}/2)`}</span>
              </button>
            ) : isMaxInCart ? (
              <button
                disabled={true}
                title="All available stock in your cart"
                className="h-8 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 shadow-none"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>In Cart ({inCartQty})</span>
              </button>
            ) : (
              <button
                onClick={handleBuy}
                title={`Add to cart (${availableStock} available)`}
                className="h-8 px-3.5 rounded-xl bg-brand-forest hover:bg-brand-dark text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            )}

            <Link to={`/listing/${listing.id}`} className="text-slate-400 hover:text-slate-700 p-1">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // GRID FORMAT (2 cards per row on mobile, 4-5 on desktop)
  return (
    <div 
      className={`rounded-2xl border overflow-hidden shadow-xs flex flex-col h-full group transition-all duration-300 ${
        isOutOfStock 
          ? 'bg-slate-50/90 border-slate-300/80 opacity-70 grayscale' 
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
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
            {autoHide && (
              <span className="mt-1 text-[9px] text-slate-300">
                Removing in {countdown}s
              </span>
            )}
            <button
              onClick={handleRestockNotify}
              disabled={maxAttemptsReached}
              className={`mt-1.5 text-[10px] font-semibold underline flex items-center gap-1 ${
                maxAttemptsReached ? 'text-slate-400 cursor-not-allowed no-underline' : 'text-amber-300 hover:text-amber-200'
              }`}
            >
              <BellRing className="w-3 h-3" />
              <span>{maxAttemptsReached ? 'Alerted (2/2)' : `Alert farmer (${attempts}/2)`}</span>
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
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {isOutOfStock ? (
              <span className="text-rose-500 font-semibold">Out of Stock</span>
            ) : (
              <span>{availableStock} {listing.unit} in stock</span>
            )}
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
                disabled={true}
                title="This product is currently out of stock"
                className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-[10px] sm:text-[11px] font-semibold cursor-not-allowed flex items-center gap-1 shadow-none shrink-0"
              >
                <span>Sold Out</span>
              </button>
            ) : isMaxInCart ? (
              <button
                disabled={true}
                title="You already have all available items in your cart"
                className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] sm:text-[11px] font-semibold cursor-not-allowed flex items-center gap-1 shadow-none shrink-0"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>In Cart</span>
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
