import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, Clock, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFarmerOrder } from '../lib/supabase';

export default function OrdersPage({ isFarmerView = false }) {
  const { orders, user, updateOrderStatus, rateOrderFarmer } = useApp();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const navigate = useNavigate();

  const isFarmer = isFarmerView || user?.role === 'farmer';

  // Filter orders by role & tab
  const filteredOrders = orders.filter(o => {
    if (isFarmer && !isFarmerOrder(o, user)) return false;
    const isStatusActive = o.order_status === 'pending' || o.order_status === 'confirmed';
    if (activeTab === 'active') return isStatusActive;
    return !isStatusActive; // delivered or cancelled
  });

  const handleOpenRating = (order) => {
    setRatingModalOrder(order);
    setSelectedRating(5);
    setRatingComment('');
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();
    if (ratingModalOrder) {
      rateOrderFarmer(ratingModalOrder.id, selectedRating, ratingComment);
      setRatingModalOrder(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-5">
      
      {/* Banner / Header with subtle background & typography */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-emerald-700/40 p-6 sm:p-7 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(10, 36, 22, 0.94) 0%, rgba(13, 74, 43, 0.88) 55%, rgba(6, 78, 59, 0.82) 100%), url('/images/B2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="space-y-1 z-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            {isFarmer ? 'Producer Order Dispatch' : 'Eswatini Harvest Tracker'}
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isFarmer ? 'Incoming Farm Orders' : 'My Produce Orders'}
          </h1>
          <p className="text-xs text-emerald-100/90 max-w-lg">
            {isFarmer 
              ? 'Real-time order fulfillment, direct landmark delivery coordinates, and customer communication.' 
              : 'Direct farmgate tracking, landmark collection points, and verified smallholder orders.'}
          </p>
        </div>

        {!isFarmer && (
          <Link
            to="/buyer/dashboard"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md whitespace-nowrap self-start sm:self-auto transition-all"
          >
            Buyer Dashboard
          </Link>
        )}
      </div>

      {/* Tabs: Active vs History */}
      <div className="flex rounded-xl bg-slate-100 p-1 max-w-xs">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'active' ? 'bg-brand-forest text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Orders
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'history' ? 'bg-brand-forest text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Order History
        </button>
      </div>

      {/* Order List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isDelivered = order.order_status === 'delivered';
            const isPending = order.order_status === 'pending';
            const isConfirmed = order.order_status === 'confirmed';

            return (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-900">#{order.id}</span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    isDelivered 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : isConfirmed 
                      ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                      : isPending 
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {order.order_status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={order.image_url || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80'} 
                      alt={order.product_name} 
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0" 
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{order.product_name}</h3>
                      <p className="text-xs text-slate-500">
                        {isFarmer ? 'Buyer order' : `Farmer: ${order.farmer_name}`}
                      </p>
                      <div className="text-xs font-semibold text-brand-forest mt-0.5">
                        {order.quantity} {order.unit} • E{order.total_price}
                      </div>
                    </div>
                  </div>

                  <Link 
                    to={`/orders/${order.id}`}
                    className="p-2 text-slate-400 hover:text-brand-forest rounded-lg hover:bg-slate-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Farmer Controls or Buyer Rate Farmer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-400 font-medium text-[11px]">
                    Payment: <strong className="text-slate-700">{order.payment_method || 'MoMo'}</strong>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* FARMER ACTIONS */}
                    {isFarmer && isPending && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="px-3 py-1.5 bg-brand-forest text-white font-bold rounded-lg hover:bg-brand-dark transition-colors"
                      >
                        Confirm Order
                      </button>
                    )}
                    {isFarmer && isConfirmed && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}

                    {/* BUYER RATE FARMER ACTION */}
                    {!isFarmer && isDelivered && (
                      order.rated ? (
                        <span className="text-emerald-800 font-bold flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Rated ({order.user_rating}★)</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenRating(order)}
                          className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-1"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Rate Farmer</span>
                        </button>
                      )
                    )}

                    <Link
                      to={`/orders/${order.id}`}
                      className="px-3 py-1.5 text-slate-700 bg-slate-100 font-semibold rounded-lg hover:bg-slate-200"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-sm mx-auto my-6 space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No {activeTab} orders</h3>
          <p className="text-xs text-slate-500">You do not have any orders in this tab right now.</p>
        </div>
      )}

      {/* RATE FARMER MODAL */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setRatingModalOrder(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full space-y-4 z-10">
            <h3 className="font-bold text-slate-900 text-base">Rate Your Experience</h3>
            <p className="text-xs text-slate-500">How was your produce from {ratingModalOrder.farmer_name}?</p>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`w-8 h-8 ${star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Written Review (Optional)</label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share details about produce quality, freshness, and farmer communication..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-dark"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
