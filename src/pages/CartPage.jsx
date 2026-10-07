import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 10 : 0; // E10 local delivery fee
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-brand-forest rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Your Cart is Empty</h1>
        <p className="text-xs text-slate-500">Explore fresh local produce from Eswatini farmers and add items to your cart.</p>
        <Link
          to="/marketplace"
          className="inline-block px-6 py-3 rounded-xl bg-brand-forest text-white font-bold text-xs hover:bg-brand-dark transition-colors shadow-sm"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Cart</h1>
        <span className="text-xs text-slate-500 font-medium">{cart.length} item(s)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Cart Item List (Mobile Stacked Layout) */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/90 p-3.5 flex items-center gap-3.5 shadow-xs"
            >
              <img 
                src={item.images ? item.images[0] : 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80'} 
                alt={item.product_type} 
                className="w-20 h-20 rounded-lg object-cover shrink-0 bg-slate-100"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{item.product_type}</h3>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500">{item.farmer_name}</p>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm font-extrabold text-brand-forest">
                    E{item.price * item.quantity}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">(E{item.price}/{item.unit})</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-600 hover:bg-slate-200 rounded-l-lg"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-slate-600 hover:bg-slate-200 rounded-r-lg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/marketplace"
            className="inline-block text-xs font-semibold text-brand-forest hover:underline pt-2"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3">Order Summary</h2>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">E{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Local Delivery Fee (Manzini Hub)</span>
              <span className="font-bold text-slate-900">E{deliveryFee}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-brand-forest">E{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 rounded-xl bg-brand-forest text-white font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure trade & verified local farmer delivery in Eswatini</span>
          </div>
        </div>

      </div>
    </div>
  );
}
