import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, PlusCircle, Sprout, TrendingUp, MessageSquare, 
  CheckCircle, ArrowUpRight, DollarSign, Clock, Edit3, ArrowRight
} from 'lucide-react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFarmerListing, isFarmerOrder } from '../lib/supabase';

export default function FarmerDashboardPage() {
  const { user, listings, orders, plantLogs, updateListingStatus } = useApp();

  const farmerListings = listings.filter(l => isFarmerListing(l, user));
  const farmerOrders = orders.filter(o => isFarmerOrder(o, user));
  
  const totalSales = farmerOrders
    .filter(o => o.order_status === 'delivered' || o.order_status === 'confirmed')
    .reduce((sum, o) => sum + o.total_price, 0);

  const pendingOrders = farmerOrders.filter(o => o.order_status === 'pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      {/* ONBOARDING ALERT: INKHUNDLA LOCATION MISSING */}
      {(!user?.inkhundla || user?.inkhundla.trim() === '') && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">Farm Location Not Set</h2>
              <p className="text-xs text-amber-700 mt-0.5">
                Please select your Manzini Inkhundla and farm location in Account Settings before adding produce listings.
              </p>
            </div>
          </div>
          <Link
            to="/account"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl text-center whitespace-nowrap transition-colors"
          >
            Set Location Now
          </Link>
        </div>
      )}

      {/* VERIFICATION NOTICE */}
      {!user?.is_verified && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-blue-900">National ID Verification Pending</h2>
              <p className="text-xs text-blue-700 mt-0.5">
                Upload your Eswatini National ID document in Account Settings to receive the verified farmer badge.
              </p>
            </div>
          </div>
          <Link
            to="/account"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl text-center whitespace-nowrap transition-colors"
          >
            Upload ID
          </Link>
        </div>
      )}

      {/* Compact Farmer Hero Header with single image H2.png (Half size of landing hero) */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-emerald-700/40 p-5 sm:p-6 text-white shadow-xl min-h-[180px] sm:min-h-[190px] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(10, 36, 22, 0.94) 0%, rgba(13, 74, 43, 0.88) 55%, rgba(6, 78, 59, 0.82) 100%), url('/images/H2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 flex items-center space-x-3.5">
          <img
            src={user?.profile_picture_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'}
            alt="Farmer"
            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shrink-0 shadow-md"
          />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Farmer Command Center</div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Welcome, {user?.full_name || 'Farmer'}</h1>
              {user?.is_verified && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">
              Producer &middot; {user?.location || 'Kingdom of Eswatini'} &middot; Verified Smallholder
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-2 shrink-0">
          <Link
            to="/farmer/listings/new"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-lg cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Listing</span>
          </Link>
        </div>
      </div>

      {/* METRICS OVERVIEW CARDS (WITH LIQUID GLASS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Listings</div>
          <div className="text-2xl font-extrabold text-slate-900">{farmerListings.length}</div>
          <Link to="/farmer/listings" className="text-[11px] text-emerald-700 font-bold hover:underline block">
            Manage listings &rarr;
          </Link>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Orders</div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingOrders.length}</div>
          <Link to="/farmer/orders" className="text-[11px] text-amber-700 font-bold hover:underline block">
            Review orders &rarr;
          </Link>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sales</div>
          <div className="text-2xl font-extrabold text-emerald-700">SZL {totalSales}</div>
          <span className="text-[11px] text-slate-500 font-medium">Settled transactions</span>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plant Logs</div>
          <div className="text-2xl font-extrabold text-slate-900">{plantLogs.length}</div>
          <Link to="/farmer/plant-logs" className="text-[11px] text-emerald-700 font-bold hover:underline block">
            View crop logs &rarr;
          </Link>
        </div>
      </div>

      {/* Rectangular Split Banner for Farmer Dashboard (B3.png with typography on left, image on right) */}
      <div className="banner-split p-6 sm:p-7 text-white flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-emerald-400/50 transition-all">
        <div className="space-y-2 z-10 flex-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200">
            <Sprout className="w-3.5 h-3.5" /> Producer Subsidy & Seeds
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-white leading-snug">
            Cooperative Bulk Seedlings & Solar Irrigation Scheme
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Registered smallholders gain subsidized access to certified vegetable seedlings, organic compost, and seasonal drip irrigation packages.
          </p>
          <div className="pt-2">
            <button
              onClick={() => alert('Agri-Input assistance request submitted! An agricultural extension officer will contact you within 24 hours.')}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap transition-colors shadow-md cursor-pointer"
            >
              Apply for Agri-Inputs
            </button>
          </div>
        </div>

        <div className="relative shrink-0 w-full sm:w-40 h-32 sm:h-32 rounded-2xl overflow-hidden border border-emerald-400/30 shadow-md group-hover:scale-105 transition-transform duration-300">
          <img 
            src="/images/B3.png" 
            alt="Cooperative Assistance" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/farmer/listings/new"
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 hover:bg-emerald-100 transition-colors"
        >
          <div className="p-2.5 bg-brand-forest text-white rounded-lg">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Add Product Listing</div>
            <div className="text-xs text-slate-600">Publish fresh harvest produce to market</div>
          </div>
        </Link>

        <Link
          to="/farmer/plant-logs"
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 hover:bg-amber-100 transition-colors"
        >
          <div className="p-2.5 bg-amber-600 text-white rounded-lg">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Private Plant Logs</div>
            <div className="text-xs text-slate-600">Track crop cycles & planting schedules</div>
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
            <div className="font-bold text-sm text-slate-900">Market Trends</div>
            <div className="text-xs text-slate-600">Check seasonal price directions & tips</div>
          </div>
        </Link>
      </div>

      {/* MY ACTIVE PRODUCE LISTINGS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">My Active Produce Listings</h2>
            <p className="text-xs text-slate-500">Your live produce available to buyers in the marketplace.</p>
          </div>
          <Link to="/farmer/listings/new" className="text-xs font-semibold text-brand-forest hover:underline flex items-center space-x-1">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Listing</span>
          </Link>
        </div>

        {farmerListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {farmerListings.map((listing) => (
              <div 
                key={listing.id} 
                className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={listing.images ? listing.images[0] : 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80'}
                    alt={listing.product_type}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{listing.product_type}</h3>
                    <div className="text-xs text-brand-forest font-semibold mt-0.5">
                      E{listing.price}/{listing.unit} <span className="text-slate-400 font-normal">({listing.quantity} {listing.unit} left)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Harvest: {listing.harvest_date || 'Recent'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1.5 shrink-0">
                  <select
                    value={listing.status}
                    onChange={(e) => updateListingStatus(listing.id, e.target.value)}
                    className={'text-[10px] font-bold px-2 py-1 rounded-md border focus:outline-none ' + (
                      listing.status === 'available'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : listing.status === 'reserved'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    )}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <div>
              <div className="font-semibold text-slate-800 text-xs">No produce listed yet.</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Add your fresh harvest produce so buyers in Eswatini can order from you.</p>
            </div>
            <Link
              to="/farmer/listings/new"
              className="inline-block px-4 py-2 bg-brand-forest text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-xs"
            >
              + Add Produce Listing Now
            </Link>
          </div>
        )}
      </div>

      {/* INCOMING ORDERS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-base">Incoming Buyer Orders</h2>
          <Link to="/farmer/orders" className="text-xs font-semibold text-brand-forest hover:underline">
            View all orders
          </Link>
        </div>

        {farmerOrders.length > 0 ? (
          <div className="space-y-3">
            {farmerOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-xs">
                    #{order.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{order.product_name}</h3>
                    <p className="text-[11px] text-slate-500">{order.quantity} {order.unit} &middot; E{order.total_price}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ' + (
                    order.order_status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  )}>
                    {order.order_status}
                  </span>
                  <Link
                    to="/farmer/orders"
                    className="text-xs font-semibold text-brand-forest hover:underline px-2 py-1"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-800 text-xs">You haven't received any buyer orders yet.</div>
            <p className="text-[11px] text-slate-500">Ensure your listings are published to receive enquiries.</p>
          </div>
        )}
      </div>

    </div>
  );
}
