import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Truck, MessageSquare, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isAuthorizedAdminEmail, isFarmerOrder } from '../lib/supabase';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { orders, user, sendMessage } = useApp();
  const navigate = useNavigate();

  // CRITICAL SECURITY: Block unauthenticated visitors
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">
          Please sign in to your FarmConnect account to view the details and tracking status of this order.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-dark transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Find exact order by ID - strictly no unauthorized fallback
  const order = orders.find(o => String(o.id) === String(id));

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested order could not be found or you do not have permission to view it.
        </p>
        <Link to="/orders" className="text-xs text-brand-forest underline font-semibold">Back to Orders</Link>
      </div>
    );
  }

  // Check strict ownership authorization
  const isAdmin = isAuthorizedAdminEmail(user?.email);
  const isAuthorized = isAdmin ||
    order.buyer_id === user.id ||
    order.user_id === user.id ||
    isFarmerOrder(order, user);

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-500">
          You are not authorized to view the private order details or customer coordinates for this order.
        </p>
        <Link to="/orders" className="text-xs text-brand-forest underline font-semibold">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', desc: 'Order details sent to farmer' },
    { title: 'Confirmed', desc: 'Farmer confirmed availability' },
    { title: 'Preparing / Transport', desc: 'Harvesting & dispatching' },
    { title: 'Delivered', desc: 'Received and verified' }
  ];

  let activeStepIndex = 0;
  if (order.order_status === 'confirmed') activeStepIndex = 1;
  if (order.order_status === 'delivered') activeStepIndex = 3;

  const handleContactFarmer = () => {
    sendMessage(
      order.farmer_id,
      order.farmer_name,
      `Hello ${order.farmer_name}, regarding order #${order.id} for ${order.product_name}...`
    );
    navigate('/messages');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Order #{order.id}</h1>
          <p className="text-xs text-slate-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* TRACKING STATUS PROGRESSION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-6 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm">Order Status Tracking</h2>

        <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
          {steps.map((step, idx) => {
            const isPassed = idx <= activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div key={step.title} className="relative">
                {/* Circle Indicator */}
                <div 
                  className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPassed 
                      ? 'bg-brand-forest text-white shadow-xs ring-4 ring-emerald-50' 
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div>
                  <h3 className={`font-bold text-sm ${isCurrent ? 'text-brand-forest' : isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ORDER ITEM & FARMER DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Item Details</h2>

        <div className="flex items-center space-x-3">
          <img 
            src={order.image_url || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80'} 
            alt={order.product_name} 
            className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm">{order.product_name}</h3>
            <p className="text-xs text-slate-500">{order.farmer_name}</p>
            <div className="text-xs font-bold text-brand-forest mt-1">
              Quantity: {order.quantity} {order.unit}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Unit Price</span>
            <span className="font-bold text-slate-900">E{order.unit_price} / {order.unit}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-bold text-slate-900">E{order.delivery_fee || 10}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
            <span>Total Paid</span>
            <span className="text-brand-forest">E{order.total_price + (order.delivery_fee || 10)}</span>
          </div>
        </div>

        <button
          onClick={handleContactFarmer}
          className="w-full py-3 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
        >
          <MessageSquare className="w-4 h-4 text-brand-forest" />
          <span>Message Farmer About This Order</span>
        </button>
      </div>

    </div>
  );
}
