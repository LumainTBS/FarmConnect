import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Package, TrendingUp, Heart, Clock, CheckCircle, 
  MapPin, Star, ArrowRight, ShieldCheck, Tag, Sparkles, Plus, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function BuyerDashboardPage() {
  const { user, orders, listings, farmers, addToCart } = useApp();

  const buyerOrders = orders.filter(o => o.buyer_id === user?.id || !o.buyer_id);
  const activeOrders = buyerOrders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed');
  const deliveredOrders = buyerOrders.filter(o => o.order_status === 'delivered');
  
  const totalSpent = deliveredOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const rewardPoints = Math.floor(totalSpent * 0.1);

  const featuredListings = listings.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      {/* Compact Buyer Hero Header with single image H3.png (Half size of landing hero) */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-emerald-700/40 p-5 sm:p-6 text-white shadow-xl min-h-[180px] sm:min-h-[190px] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(10, 36, 22, 0.94) 0%, rgba(13, 74, 43, 0.88) 55%, rgba(6, 78, 59, 0.82) 100%), url('/images/H3.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 flex items-center space-x-3.5">
          <img
            src={user?.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt="Buyer"
            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shrink-0 shadow-md"
          />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Commercial & Household Buyer Center
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Welcome back, {user?.full_name || 'Buyer'}
              </h1>
              {user?.is_verified && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">
              {user?.location || 'Kingdom of Eswatini'} &middot; Verified Local Procurement
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-2 shrink-0">
          <Link
            to="/marketplace"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-lg cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Fresh Market</span>
          </Link>
        </div>
      </div>

      {/* METRICS OVERVIEW CARDS (WITH LIQUID GLASS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Deliveries</div>
          <div className="text-2xl font-extrabold text-emerald-700">{activeOrders.length}</div>
          <Link to="/orders" className="text-[11px] text-emerald-700 font-bold hover:underline block">
            Track deliveries &rarr;
          </Link>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Orders</div>
          <div className="text-2xl font-extrabold text-slate-900">{deliveredOrders.length}</div>
          <Link to="/orders" className="text-[11px] text-slate-600 font-bold hover:underline block">
            Order history &rarr;
          </Link>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Procurement Spend</div>
          <div className="text-2xl font-extrabold text-slate-900">SZL {totalSpent}</div>
          <span className="text-[11px] text-slate-500 font-medium">Direct farmgate prices</span>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reward Credits</div>
          <div className="text-2xl font-extrabold text-amber-600">SZL {rewardPoints}</div>
          <span className="text-[11px] text-amber-700 font-bold block">10% harvest cashback</span>
        </div>
      </div>

      {/* RECTANGULAR SPLIT BANNER FOR BUYER (B1.png with typography on left, image on right) */}
      <div className="banner-split p-6 sm:p-7 text-white flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-emerald-400/50 transition-all">
        <div className="space-y-2 z-10 flex-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200">
            <Tag className="w-3.5 h-3.5" /> Buyer Exclusive Rebate
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-white leading-snug">
            Weekly Bulk Harvest Savings Scheme
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Consolidate your institutional or family vegetable orders across Malkerns and Lowveld farms to receive prioritized landmark drop-offs and fee waivers.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <Link
              to="/marketplace"
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap transition-colors shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Explore Group Harvests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative shrink-0 w-full sm:w-40 h-32 sm:h-32 rounded-2xl overflow-hidden border border-emerald-400/30 shadow-md group-hover:scale-105 transition-transform duration-300">
          <img 
            src="/images/B1.png" 
            alt="Buyer Rebate Scheme" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/marketplace"
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 hover:bg-emerald-100 transition-colors"
        >
          <div className="p-2.5 bg-brand-forest text-white rounded-lg">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Live Marketplace</div>
            <div className="text-xs text-slate-600">Order fresh harvests direct from farmers</div>
          </div>
        </Link>

        <Link
          to="/farmers"
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 hover:bg-amber-100 transition-colors"
        >
          <div className="p-2.5 bg-amber-600 text-white rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Local Farmers Directory</div>
            <div className="text-xs text-slate-600">Find nearby verified growers by region</div>
          </div>
        </Link>

        <Link
          to="/market-trends"
          className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3 hover:bg-blue-100 transition-colors"
        >
          <div className="p-2.5 bg-blue-600 text-white rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Eswatini Market Prices</div>
            <div className="text-xs text-slate-600">Benchmark weekly wholesale prices</div>
          </div>
        </Link>
      </div>

      {/* RECENT ORDERS SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">My Recent Produce Orders</h2>
            <p className="text-xs text-slate-500">Track current harvest dispatches and confirmed pickups.</p>
          </div>
          <Link to="/orders" className="text-xs font-semibold text-brand-forest hover:underline flex items-center gap-1">
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {buyerOrders.length > 0 ? (
          <div className="space-y-3">
            {buyerOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <img
                    src={order.image_url || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80'}
                    alt={order.product_name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{order.product_name}</h3>
                    <p className="text-[11px] text-slate-500">
                      Farmer: {order.farmer_name} &middot; {order.quantity} {order.unit}
                    </p>
                    <div className="text-xs font-semibold text-brand-forest mt-0.5">
                      SZL {order.total_price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-900'
                      : order.order_status === 'confirmed'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {order.order_status}
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-xs font-semibold text-brand-forest hover:underline"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <div>
              <div className="font-semibold text-slate-800 text-xs">No active orders placed yet.</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Explore fresh harvests in the marketplace and support local growers.</p>
            </div>
            <Link
              to="/marketplace"
              className="inline-block px-4 py-2 bg-brand-forest text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-xs"
            >
              Start Shopping Fresh Produce
            </Link>
          </div>
        )}
      </div>

      {/* RECOMMENDED PRODUCE FOR YOU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Recommended Fresh Harvests</h2>
            <p className="text-xs text-slate-500">Popular seasonal crops currently available in your region.</p>
          </div>
          <Link to="/marketplace" className="text-xs font-semibold text-brand-forest hover:underline flex items-center gap-1">
            <span>Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featuredListings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

    </div>
  );
}
