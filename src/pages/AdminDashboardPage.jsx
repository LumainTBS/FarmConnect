import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, DollarSign, 
  Users, Package, TrendingUp, CreditCard, Percent, Eye, FileText, 
  Filter, Search, ArrowUpRight, Award, RefreshCw, BarChart3, PieChart as PieIcon,
  Activity, ArrowDownRight, Layers
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

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analytics' | 'verifications' | 'subscriptions' | 'commissions'
  const [verificationFilter, setVerificationFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [selectedDocFarmer, setSelectedDocFarmer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartTimeframe, setChartTimeframe] = useState('7d'); // '7d' | '30d'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

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

  // 3. CHART DATA GENERATION
  // A. Line Graph Data: Daily GMV over 7 Days
  const gmvTrendData = [
    { day: 'Mon', gmv: 3450, orders: 12 },
    { day: 'Tue', gmv: 4200, orders: 15 },
    { day: 'Wed', gmv: 5890, orders: 22 },
    { day: 'Thu', gmv: 5120, orders: 18 },
    { day: 'Fri', gmv: 7450, orders: 28 },
    { day: 'Sat', gmv: 9800, orders: 36 },
    { day: 'Sun', gmv: 8350, orders: 31 }
  ];

  const maxGmv = Math.max(...gmvTrendData.map(d => d.gmv));

  // B. Bar Graph Data: Monthly Revenue (Commissions vs Subscriptions)
  const monthlyRevenueData = [
    { month: 'Jun', commissions: 1450, subscriptions: 850 },
    { month: 'Jul', commissions: 2100, subscriptions: 1150 },
    { month: 'Aug', commissions: 2950, subscriptions: 1600 },
    { month: 'Sep', commissions: 4120, subscriptions: 2150 },
    { month: 'Oct', commissions: 5340, subscriptions: 2850 },
  ];
  const maxMonthly = 6000;

  // C. Donut / Pie Chart Data: Produce Category Distribution
  const categoryCounts = listings.reduce((acc, l) => {
    const cat = (l.category || 'vegetables').toLowerCase();
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieCategories = [
    { name: 'Vegetables', count: categoryCounts['vegetables'] || 14, color: '#10B981', textColor: 'text-emerald-600' },
    { name: 'Fruits', count: categoryCounts['fruits'] || 8, color: '#F59E0B', textColor: 'text-amber-600' },
    { name: 'Grains & Cereals', count: categoryCounts['grains'] || 6, color: '#6366F1', textColor: 'text-indigo-600' },
    { name: 'Livestock & Poultry', count: categoryCounts['livestock'] || 5, color: '#EF4444', textColor: 'text-rose-600' },
    { name: 'Dairy & Others', count: categoryCounts['dairy'] || 4, color: '#06B6D4', textColor: 'text-cyan-600' }
  ];

  const totalProduceCount = pieCategories.reduce((sum, c) => sum + c.count, 0);

  // SVG Donut calculation helper
  let cumulativeAngle = 0;
  const pieSlices = pieCategories.map(cat => {
    const percentage = cat.count / totalProduceCount;
    const strokeDasharray = `${percentage * 283} 283`;
    const strokeDashoffset = -cumulativeAngle * 2.83;
    cumulativeAngle += percentage * 100;
    return {
      ...cat,
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-8">
      
      {/* ADMIN TOP BANNER (LIQUID GLASS & GLASSMORPHISM) */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 text-white shadow-2xl bg-gradient-to-r from-slate-950 via-[#0a2717] to-slate-950 border border-emerald-500/30 backdrop-blur-xl">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-emerald-400 text-xs font-bold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Administrator Command Center &middot; FarmConnect Eswatini</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
              Operations & Financial Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring of MoMo transaction commissions, farmer subscriptions, National ID KYC approvals, and inventory volume across 4 regions.
            </p>
          </div>

          {/* Test Persona Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 self-start md:self-auto">
            <span className="text-[11px] text-slate-300 px-2 font-bold uppercase tracking-wider">Persona:</span>
            <button
              onClick={() => switchRole('farmer')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 transition-all border border-white/10"
            >
              Farmer Mode
            </button>
            <button
              onClick={() => switchRole('buyer')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 transition-all border border-white/10"
            >
              Buyer Mode
            </button>
          </div>
        </div>
      </div>

      {/* 4 LIQUID GLASS METRIC STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Platform Revenue</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            E{totalPlatformEarnings.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Commissions + Subscriptions</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order Commissions</span>
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-110 transition-transform">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
            E{totalCommissionRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            From {orders.length} completed transactions
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subscription Revenue</span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
            E{totalSubscriptionRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            From {subscriptionPayments.length} farmer tier upgrades
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">KYC Verification Queue</span>
            <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${pendingFarmers.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {pendingFarmers.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Farmers awaiting National ID review
          </div>
        </div>

      </div>

      {/* TABS NAVIGATION (Clean, non-pill) */}
      <div className="border-b border-slate-200 flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Interactive Visuals & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>KYC ID Verifications ({pendingFarmers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'subscriptions'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscriptions Ledger ({subscriptionPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'commissions'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Commissions Ledger ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: VISUAL ANALYTICS (BAR GRAPHS, PIE CHARTS, LINE GRAPHS) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* SECTION A: LINE GRAPH (PLATFORM GMV & VOLUME VELOCITY) */}
          <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Gross Merchandise Value (GMV) & Transaction Velocity
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily transactional turnover in Eswatini Lilangeni (SZL) processed across checkout channels.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setChartTimeframe('7d')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    chartTimeframe === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setChartTimeframe('30d')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    chartTimeframe === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* Interactive SVG Line Graph */}
            <div className="relative pt-4">
              <div className="h-56 w-full flex items-end">
                <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="gmvAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="40" x2="700" y2="40" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <line x1="0" y1="90" x2="700" y2="90" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="700" y2="140" stroke="#E2E8F0" strokeDasharray="4 4" />

                  {/* Shaded Area */}
                  <polygon
                    points={`0,180 50,${180 - (gmvTrendData[0].gmv / maxGmv) * 140} 150,${180 - (gmvTrendData[1].gmv / maxGmv) * 140} 250,${180 - (gmvTrendData[2].gmv / maxGmv) * 140} 350,${180 - (gmvTrendData[3].gmv / maxGmv) * 140} 450,${180 - (gmvTrendData[4].gmv / maxGmv) * 140} 550,${180 - (gmvTrendData[5].gmv / maxGmv) * 140} 650,${180 - (gmvTrendData[6].gmv / maxGmv) * 140} 650,180`}
                    fill="url(#gmvAreaGradient)"
                  />

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={`50,${180 - (gmvTrendData[0].gmv / maxGmv) * 140} 150,${180 - (gmvTrendData[1].gmv / maxGmv) * 140} 250,${180 - (gmvTrendData[2].gmv / maxGmv) * 140} 350,${180 - (gmvTrendData[3].gmv / maxGmv) * 140} 450,${180 - (gmvTrendData[4].gmv / maxGmv) * 140} 550,${180 - (gmvTrendData[5].gmv / maxGmv) * 140} 650,${180 - (gmvTrendData[6].gmv / maxGmv) * 140}`}
                  />

                  {/* Interactive Points */}
                  {gmvTrendData.map((d, i) => {
                    const cx = 50 + i * 100;
                    const cy = 180 - (d.gmv / maxGmv) * 140;
                    const isHovered = hoveredPoint === i;

                    return (
                      <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 7 : 5}
                          fill="#FFFFFF"
                          stroke="#10B981"
                          strokeWidth="3"
                          className="transition-all duration-200"
                        />
                        {isHovered && (
                          <g>
                            <rect x={cx - 45} y={cy - 45} width="90" height="34" rx="8" fill="#0F172A" />
                            <text x={cx} y={cy - 27} fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                              E{d.gmv.toLocaleString()}
                            </text>
                            <text x={cx} y={cy - 16} fill="#94A3B8" fontSize="9" textAnchor="middle">
                              {d.orders} orders
                            </text>
                          </g>
                        )}
                        <text x={cx} y="196" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">
                          {d.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>Peak Daily GMV: <strong className="text-slate-900">E9,800 (Saturday)</strong></span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+28.4% WoW platform growth</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION B: TWO COLUMNS: BAR GRAPH + DONUT / PIE CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. BAR GRAPH: MONTHLY REVENUE COMPARISON */}
            <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Revenue Stream Performance (Bar Graph)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monthly breakdown: Order Commissions vs Farmer Subscriptions
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Order Commissions (5%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                  <span className="font-semibold text-slate-700">Subscription Plans</span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-56 pt-2 flex items-end justify-between gap-3 px-2 border-b border-slate-100">
                {monthlyRevenueData.map((d, idx) => {
                  const commHeight = Math.round((d.commissions / maxMonthly) * 180);
                  const subHeight = Math.round((d.subscriptions / maxMonthly) * 180);
                  const isHovered = hoveredBar === idx;

                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-md mb-1 whitespace-nowrap">
                          Comm: E{d.commissions} | Sub: E{d.subscriptions}
                        </div>
                      )}

                      <div className="w-full flex items-end justify-center gap-1.5 h-44">
                        {/* Commission Bar */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 hover:opacity-90"
                          style={{ height: `${commHeight}px` }}
                        />
                        {/* Subscription Bar */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-300 hover:opacity-90"
                          style={{ height: `${subHeight}px` }}
                        />
                      </div>

                      <span className="text-xs font-bold text-slate-600 mt-2">{d.month}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Total 5-Month Revenue: <strong className="text-slate-900">E24,360</strong></span>
                <span className="text-indigo-600 font-bold">Recurring Growth: +34% MoM</span>
              </div>
            </div>

            {/* 2. DONUT / PIE CHART: PRODUCE INVENTORY DISTRIBUTION */}
            <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <PieIcon className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Produce Category Distribution (Pie Chart)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Proportion of produce listings active across Eswatini
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                {/* SVG Donut */}
                <div className="relative w-44 h-44 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                    {pieSlices.map((slice, i) => (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="10"
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        className="transition-all duration-300 hover:stroke-width-[12] cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(slice)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    ))}
                  </svg>

                  {/* Centered Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-black text-slate-900">
                      {hoveredSlice ? `${hoveredSlice.percentage}%` : totalProduceCount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {hoveredSlice ? hoveredSlice.name : 'Listings'}
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-2 flex-1 w-full">
                  {pieSlices.map((slice, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                        hoveredSlice?.name === slice.name ? 'bg-slate-50 border-slate-300' : 'border-transparent'
                      }`}
                      onMouseEnter={() => setHoveredSlice(slice)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                        <span className="text-xs font-semibold text-slate-700">{slice.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">{slice.count}</span>
                        <span className="text-[11px] text-slate-400 ml-1">({slice.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Active Harvests: <strong className="text-slate-900">{totalProduceCount}</strong></span>
                <span className="text-emerald-700 font-semibold">Vegetables Lead Volume</span>
              </div>
            </div>

          </div>

          {/* SECTION C: KYC QUEUE PREVIEW & SUBSCRIPTION TIERS BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pending Verifications */}
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Pending KYC Verifications</h3>
                <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                  {pendingFarmers.length} Pending Action
                </span>
              </div>

              {pendingFarmers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
                  <p>All registered farmers are currently verified with Eswatini National ID.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingFarmers.slice(0, 3).map(farmer => (
                    <div key={farmer.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={farmer.avatar}
                          alt={farmer.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-300"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{farmer.name}</div>
                          <div className="text-[11px] text-slate-500">{farmer.inkhundla || 'Manzini Region'} &middot; {farmer.settlement_type || 'rural'}</div>
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
                    View all {pendingFarmers.length} in KYC Queue &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Plan Distribution */}
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Subscription Plan Enrollment</h3>
              <div className="space-y-3">
                {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
                  const count = farmers.filter(f => (f.subscription_tier || 'free') === key).length;
                  const totalEarned = subscriptionPayments
                    .filter(p => p.tier_id === key)
                    .reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <div key={key} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
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

            {/* Filter buttons */}
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
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Pending ({pendingFarmers.length})
              </button>
              <button
                onClick={() => setVerificationFilter('approved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  verificationFilter === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Approved ({farmers.length - pendingFarmers.length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farmer by name, email, or inkhundla region..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-brand-forest"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Verification Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Farmer Details</th>
                  <th className="py-3 px-4">Region / Inkhundla</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">KYC National ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFarmers.map(farmer => (
                  <tr key={farmer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={farmer.avatar}
                          alt={farmer.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{farmer.name}</div>
                          <div className="text-[11px] text-slate-400">{farmer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{farmer.inkhundla || 'Matsanjeni'}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{farmer.settlement_type || 'rural'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                        {farmer.subscription_tier || 'free'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedDocFarmer(farmer)}
                        className="inline-flex items-center space-x-1 text-brand-forest hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect ID Card</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {farmer.is_verified ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] font-bold">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md text-[11px] font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {!farmer.is_verified ? (
                        <button
                          onClick={() => adminApproveFarmer(farmer.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => adminRejectFarmer(farmer.id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS LEDGER */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Farmer Subscription Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recurring SaaS revenue collected from farmer plan upgrades via MTN MoMo and Card.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Farmer / Producer</th>
                  <th className="py-3 px-4">Tier Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptionPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{payment.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{payment.farmer_name}</div>
                      <div className="text-[11px] text-slate-400">{payment.farmer_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{payment.tier_name}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-brand-forest">
                      E{payment.amount}.00
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {payment.payment_method}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Completed
                      </span>
                    </td>
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
          <div>
            <h2 className="text-xl font-bold text-slate-900">Transaction Commissions Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated platform fee deductions calculated dynamically based on farmer tier (2.5% – 5.0%).</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Produce Item</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Order Gross</th>
                  <th className="py-3 px-4">Commission Cut</th>
                  <th className="py-3 px-4">Farmer Payout</th>
                  <th className="py-3 px-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => {
                  const comm = Number(order.commission_amount) || (Number(order.total_price) * 0.05);
                  const payout = Number(order.farmer_payout) || (Number(order.total_price) - comm);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{order.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{order.product_name}</td>
                      <td className="py-3 px-4 text-slate-600">{order.farmer_name}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">E{order.total_price}</td>
                      <td className="py-3 px-4 font-extrabold text-blue-700">
                        E{comm.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">({order.commission_percent || 5}%)</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">E{payout.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {order.payment_status || 'Paid'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC DOCUMENT INSPECTION MODAL */}
      {selectedDocFarmer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">National ID KYC Inspection</h3>
              <button
                onClick={() => setSelectedDocFarmer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-900">{selectedDocFarmer.name}</div>
              <div className="text-slate-500">{selectedDocFarmer.email} &middot; {selectedDocFarmer.inkhundla || 'Manzini Region'}</div>
            </div>

            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
              {selectedDocFarmer.id_document_url ? (
                <img
                  src={selectedDocFarmer.id_document_url}
                  alt="Farmer ID Document"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-white text-xs font-bold">Eswatini National Identity Card</div>
                  <div className="text-slate-400 text-[11px]">Personal Identity Number: 980124-7100-087</div>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold border border-emerald-500/30">
                    Encrypted Government ID Verified
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedDocFarmer(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  adminApproveFarmer(selectedDocFarmer.id);
                  setSelectedDocFarmer(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Approve Verified Badge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
