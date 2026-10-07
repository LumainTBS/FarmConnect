import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, DollarSign, 
  Users, Package, TrendingUp, CreditCard, Percent, Eye, FileText, 
  Filter, Search, ArrowUpRight, Award, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_TIERS } from '../lib/supabase';

export default function AdminDashboardPage() {
  const { 
    user, 
    farmers, 
    orders, 
    listings, 
    subscriptionPayments,
    adminApproveFarmer,
    adminRejectFarmer,
    adminChangeFarmerTier,
    switchRole
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'subscriptions' | 'commissions'
  const [verificationFilter, setVerificationFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [selectedDocFarmer, setSelectedDocFarmer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. REVENUE CALCULATIONS
  const totalCommissionRevenue = orders
    .reduce((sum, o) => sum + (Number(o.commission_amount) || (Number(o.total_price) * 0.05)), 0);

  const totalSubscriptionRevenue = subscriptionPayments
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPlatformEarnings = totalCommissionRevenue + totalSubscriptionRevenue;

  const totalGrossMerchandiseValue = orders
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  // 2. VERIFICATIONS QUEUE
  const pendingFarmers = farmers.filter(f => !f.is_verified || f.verification_status === 'pending');
  
  const filteredFarmers = farmers.filter(f => {
    if (verificationFilter === 'pending') return !f.is_verified || f.verification_status === 'pending';
    if (verificationFilter === 'approved') return f.is_verified || f.verification_status === 'approved';
    return true;
  }).filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (f.name && f.name.toLowerCase().includes(q)) || 
           (f.email && f.email.toLowerCase().includes(q)) ||
           (f.inkhundla && f.inkhundla.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      
      {/* ADMIN TOP BANNER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADMINISTRATOR PORTAL • FARM CONNECT ESWATINI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Operations & Financial Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Real-time control center for transaction commissions, farmer subscriptions, National ID KYC approvals, and marketplace activity.
          </p>
        </div>

        {/* Demo Switcher Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/80 self-start md:self-auto">
          <span className="text-[11px] text-slate-400 px-2 font-semibold">Test Persona:</span>
          <button
            onClick={() => switchRole('farmer')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            Farmer Mode
          </button>
          <button
            onClick={() => switchRole('buyer')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            Buyer Mode
          </button>
        </div>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Farm Connect Earnings</span>
            <div className="p-2 bg-emerald-50 text-brand-forest rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            E{totalPlatformEarnings.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            Commissions + Subscriptions
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Commissions</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900">
            E{totalCommissionRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            From {orders.length} platform transactions
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Revenue</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900">
            E{totalSubscriptionRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            From {subscriptionPayments.length} farmer tier upgrades
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KYC Verification Queue</span>
            <div className={`p-2 rounded-xl ${pendingFarmers.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {pendingFarmers.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Farmers awaiting National ID review
          </div>
        </div>

      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-slate-200 flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Operations Overview
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'verifications'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Farmer ID Approvals</span>
          {pendingFarmers.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingFarmers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'subscriptions'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Subscriptions Ledger ({subscriptionPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'commissions'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Commissions Ledger ({orders.length})
        </button>
      </div>

      {/* TAB 1: OPERATIONS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick KYC Action Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Pending Verification Requests</h3>
                <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {pendingFarmers.length} Action Needed
                </span>
              </div>

              {pendingFarmers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
                  <p>All registered farmers are currently verified.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingFarmers.slice(0, 3).map(farmer => (
                    <div key={farmer.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={farmer.avatar}
                          alt={farmer.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{farmer.name}</div>
                          <div className="text-[11px] text-slate-500">{farmer.inkhundla || 'Manzini Region'} • {farmer.settlement_type || 'rural'}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => adminApproveFarmer(farmer.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setActiveTab('verifications')}
                    className="w-full py-2 text-xs font-bold text-brand-forest hover:underline text-center block"
                  >
                    View all {pendingFarmers.length} in KYC Queue →
                  </button>
                </div>
              )}
            </div>

            {/* Subscription Revenue Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Subscription Plan Distribution</h3>
              <div className="space-y-3">
                {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
                  const count = farmers.filter(f => (f.subscription_tier || 'free') === key).length;
                  const totalEarned = subscriptionPayments
                    .filter(p => p.tier_id === key)
                    .reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <div key={key} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tier.badgeColor}`}>
                          {tier.name}
                        </span>
                        <span className="text-xs text-slate-600 font-semibold">{count} Farmers Active</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">E{totalEarned} earned</div>
                        <div className="text-[10px] text-slate-400">E{tier.price}/mo per user</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: FARMER ID KYC APPROVALS */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Farmer Verification & KYC Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review Eswatini National ID documents and manage verified badges.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVerificationFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  verificationFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({farmers.length})
              </button>
              <button
                onClick={() => setVerificationFilter('pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  verificationFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({pendingFarmers.length})
              </button>
              <button
                onClick={() => setVerificationFilter('approved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  verificationFilter === 'approved'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Approved ({farmers.filter(f => f.is_verified).length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farmer name, Inkhundla, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-brand-forest"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Farmers Verification Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-3 px-4 font-bold text-slate-700">Farmer</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Location / Inkhundla</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Subscription Plan</th>
                  <th className="py-3 px-4 font-bold text-slate-700 text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFarmers.map(farmer => {
                  const isVerified = farmer.is_verified || farmer.verification_status === 'approved';
                  const tier = SUBSCRIPTION_TIERS[farmer.subscription_tier || 'free'] || SUBSCRIPTION_TIERS.free;

                  return (
                    <tr key={farmer.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={farmer.avatar}
                            alt={farmer.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1">
                              <span>{farmer.name}</span>
                              {isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <div className="text-[11px] text-slate-400">{farmer.email || farmer.phone || 'No email'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{farmer.inkhundla ? `${farmer.inkhundla} (Rural)` : (farmer.location || 'Manzini')}</div>
                        <div className="text-[10px] text-slate-400">Settlement: {farmer.settlement_type || 'rural'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tier.badgeColor}`}>
                          {tier.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isVerified ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedDocFarmer(farmer)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="Preview National ID Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isVerified ? (
                            <button
                              onClick={() => adminRejectFarmer(farmer.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg transition-colors"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => adminApproveFarmer(farmer.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
                            >
                              Approve ID
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS LEDGER */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Farmer Subscriptions & Upgrades Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">Track recurring subscription revenue collected across all farmers.</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-400 uppercase">Total Collected</div>
              <div className="text-2xl font-black text-amber-900">E{totalSubscriptionRevenue.toFixed(2)}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-3 px-4 font-bold text-slate-700">Transaction ID</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Farmer</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Plan Subscribed</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Payment Gateway</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Amount (E)</th>
                  <th className="py-3 px-4 font-bold text-slate-700 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptionPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{payment.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{payment.farmer_name}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-brand-forest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {payment.tier_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{payment.payment_method}</td>
                    <td className="py-3 px-4 font-black text-slate-900">E{payment.amount}.00</td>
                    <td className="py-3 px-4 text-right text-slate-500">{new Date(payment.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSIONS LEDGER */}
      {activeTab === 'commissions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Transaction Commission Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">Platform fee retained per order based on each farmer's subscription tier.</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-400 uppercase">Platform Fees Retained</div>
              <div className="text-2xl font-black text-blue-900">E{totalCommissionRevenue.toFixed(2)}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-3 px-4 font-bold text-slate-700">Order ID</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Farmer</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Product</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Total Value</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Commission Rate</th>
                  <th className="py-3 px-4 font-bold text-emerald-800">Platform Retained (E)</th>
                  <th className="py-3 px-4 font-bold text-slate-700 text-right">Farmer Payout (E)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => {
                  const rate = order.commission_rate || 0.05;
                  const commission = order.commission_amount || (order.total_price * rate);
                  const payout = order.farmer_payout || (order.total_price - commission);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{order.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{order.farmer_name}</td>
                      <td className="py-3 px-4 text-slate-700">{order.product_name} ({order.quantity} {order.unit})</td>
                      <td className="py-3 px-4 font-bold text-slate-900">E{order.total_price}.00</td>
                      <td className="py-3 px-4 text-slate-600">{(rate * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 font-black text-blue-900">E{commission.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-800">E{payout.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ID DOCUMENT PREVIEW MODAL */}
      {selectedDocFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedDocFarmer.name} — Verification Review</h3>
                <p className="text-xs text-slate-500">Eswatini National Identification Card</p>
              </div>
              <button
                onClick={() => setSelectedDocFarmer(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Document Image */}
            <div className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-200">
              <img
                src={selectedDocFarmer.id_document_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                alt="ID Document"
                className="max-h-56 object-contain rounded-lg shadow-sm"
              />
              <span className="text-[11px] text-slate-500 mt-2 font-medium">Kingdom of Eswatini National ID / Proof of Land Tenure</span>
            </div>

            {/* Farmer Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Inkhundla</span>
                <strong className="text-slate-800">{selectedDocFarmer.inkhundla || 'Not Specified'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Settlement Type</span>
                <strong className="text-slate-800">{selectedDocFarmer.settlement_type || 'Rural'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Phone</span>
                <strong className="text-slate-800">{selectedDocFarmer.phone || '+268 7600 0000'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Current Status</span>
                <strong className={selectedDocFarmer.is_verified ? 'text-emerald-700' : 'text-amber-700'}>
                  {selectedDocFarmer.is_verified ? 'Approved' : 'Pending Review'}
                </strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  adminRejectFarmer(selectedDocFarmer.id);
                  setSelectedDocFarmer(null);
                }}
                className="w-1/2 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                Reject KYC
              </button>
              <button
                onClick={() => {
                  adminApproveFarmer(selectedDocFarmer.id);
                  setSelectedDocFarmer(null);
                }}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                Approve & Verify Farmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
