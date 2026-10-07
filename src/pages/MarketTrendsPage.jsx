import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, MapPin, Lightbulb, 
  Sprout, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_SEASONAL_TIPS, SUBSCRIPTION_TIERS } from '../lib/supabase';

export default function MarketTrendsPage() {
  const { user } = useApp();
  
  const userTier = user?.subscription_tier || 'free';
  const hasAccess = userTier === 'premium' || userTier === 'investor' || user?.role === 'admin' || user?.role === 'buyer';

  const priceTrends = [
    { product: 'Fresh Spinach', region: 'Manzini Region', current_price: 'E20/kg', trend: 'stable', change: '0%', forecast: 'High demand expected entering winter' },
    { product: 'Tomatoes (Roma & Round)', region: 'Hhohho Lowveld', current_price: 'E15/kg', trend: 'falling', change: '-12%', forecast: 'Peak harvest influx in Malkerns' },
    { product: 'Yellow Maize (Grain)', region: 'Malkerns Valley', current_price: 'E12/kg', trend: 'rising', change: '+8%', forecast: 'Milling demand growing steady' },
    { product: 'Grass-fed Beef (Carcass)', region: 'Mbabane Abattoir', current_price: 'E70/kg', trend: 'stable', change: '0%', forecast: 'Stable institutional orders' },
    { product: 'Free Range Eggs (Crate)', region: 'Piggs Peak', current_price: 'E40/dozen', trend: 'rising', change: '+5%', forecast: 'Supply deficit in urban bakeries' },
    { product: 'Cabbage (Drumhead)', region: 'Shiselweni Highveld', current_price: 'E18/head', trend: 'rising', change: '+10%', forecast: 'Cold season scarcity' }
  ];

  // IF FARMER DOES NOT HAVE ACCESS (Free or Basic plan)
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-8">
        
        {/* LOCKED HERO BANNER */}
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl overflow-hidden border border-slate-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-forest/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-xl mx-auto space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>PREMIUM & INVESTOR TIER EXCLUSIVE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Unlock Eswatini Agricultural Price Intelligence
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time regional crop price tracking, seasonal harvest forecasting, and wholesale market alerts are exclusively available for Commercial Producers (<strong className="text-emerald-400">Premium</strong>) and Agri-Enterprises (<strong className="text-amber-400">Investor</strong>).
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/subscriptions"
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-forest hover:bg-brand-dark text-white font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Upgrade to Unlock Market Trends</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* TEASER PREVIEW (BLURRED / SNEAK PEEK) */}
        <div className="space-y-4 opacity-50 filter blur-[2px] pointer-events-none select-none">
          <h2 className="font-bold text-slate-900 text-sm">Regional Price Overview (Preview)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {priceTrends.slice(0, 3).map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{item.region}</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">Active</span>
                </div>
                <h3 className="font-bold text-slate-900">{item.product}</h3>
                <div className="text-lg font-bold text-brand-forest">{item.current_price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WHY UPGRADE FEATURE HIGHLIGHTS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">What You Get with Premium & Investor Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div className="font-bold text-slate-900">Price Trend Fluctuations</div>
              <p className="text-slate-500">Know exactly when prices peak across Manzini, Hhohho, and Lubombo regions.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <div className="font-bold text-slate-900">Seasonal Harvest Advice</div>
              <p className="text-slate-500">Rule-based recommendations on high-yield planting timing to maximize crop value.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div className="font-bold text-slate-900">Reduced Platform Fees</div>
              <p className="text-slate-500">Save with 2.5% (Premium) or 1.0% (Investor) platform transaction commissions.</p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // UNLOCKED VIEW (Premium / Investor / Buyer / Admin)
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Agricultural Market Trends</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-300">
              Unlocked ({SUBSCRIPTION_TIERS[userTier]?.name || 'Pro Access'})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Live recorded produce prices, regional supply indices, and seasonal crop forecasts across the Kingdom of Eswatini.</p>
        </div>

        {user?.role === 'farmer' && (
          <Link
            to="/subscriptions"
            className="text-xs font-bold text-brand-forest hover:underline self-start sm:self-auto"
          >
            Manage Subscription →
          </Link>
        )}
      </div>

      {/* PRICE TREND CARDS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Regional Price Overview & 7-Day Movement</h2>
          <span className="text-xs text-slate-400 font-medium">Updated today</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {priceTrends.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-xs hover:border-brand-forest/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.region}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  item.trend === 'rising' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  item.trend === 'falling' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.trend === 'rising' && <TrendingUp className="w-3 h-3 text-rose-600" />}
                  {item.trend === 'falling' && <TrendingDown className="w-3 h-3 text-emerald-600" />}
                  {item.trend === 'stable' && <Minus className="w-3 h-3 text-slate-500" />}
                  <span className="capitalize">{item.trend} ({item.change})</span>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{item.product}</h3>
                <div className="text-2xl font-extrabold text-brand-forest mt-0.5">{item.current_price}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-start space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{item.forecast}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEASONAL TIPS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="font-bold text-slate-900 text-base">Seasonal Farming Advice (Eswatini Agricultural Calendar)</h2>
            <p className="text-xs text-slate-500">Curated planting and harvesting guidelines based on regional seasonal cycles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_SEASONAL_TIPS.map((tip) => (
            <div key={tip.id} className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs flex items-center space-x-1">
                  <Sprout className="w-3.5 h-3.5 text-amber-700" />
                  <span>{tip.product_type}</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {tip.region}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{tip.tip_text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
