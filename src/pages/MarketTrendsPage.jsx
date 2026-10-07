import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, MapPin, Lightbulb, 
  Sprout, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2,
  CloudSun, Droplets, Wind, Thermometer, BarChart3, LineChart,
  Filter, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_SEASONAL_TIPS, SUBSCRIPTION_TIERS } from '../lib/supabase';

// Comprehensive Eswatini Market Trends & Price History Dataset
const ESWATINI_CROP_TRENDS = [
  {
    id: 'spinach',
    name: 'Fresh Spinach',
    category: 'vegetables',
    unit: 'kg',
    currentPrice: 20,
    prevPrice: 20,
    changePercent: 0,
    trend: 'stable',
    volume: '14.2 Tons',
    topRegion: 'Manzini Region (Ludzeludze)',
    supplyStatus: 'High',
    demandStatus: 'Very High',
    forecast: 'Stable prices through spring; increased urban market demand.',
    history: [
      { month: 'May', price: 16 },
      { month: 'Jun', price: 17 },
      { month: 'Jul', price: 19 },
      { month: 'Aug', price: 21 },
      { month: 'Sep', price: 20 },
      { month: 'Oct', price: 20 }
    ]
  },
  {
    id: 'tomatoes',
    name: 'Fresh Farm Tomatoes',
    category: 'vegetables',
    unit: 'kg',
    currentPrice: 15,
    prevPrice: 17,
    changePercent: -11.8,
    trend: 'falling',
    volume: '28.5 Tons',
    topRegion: 'Hhohho (Malkerns & Ezulwini)',
    supplyStatus: 'Surplus',
    demandStatus: 'Moderate',
    forecast: 'Peak harvest influx in Malkerns lowveld creating buyer advantage.',
    history: [
      { month: 'May', price: 22 },
      { month: 'Jun', price: 20 },
      { month: 'Jul', price: 19 },
      { month: 'Aug', price: 18 },
      { month: 'Sep', price: 17 },
      { month: 'Oct', price: 15 }
    ]
  },
  {
    id: 'maize',
    name: 'Yellow Sweet Maize',
    category: 'grains',
    unit: 'kg',
    currentPrice: 12,
    prevPrice: 11,
    changePercent: +9.1,
    trend: 'rising',
    volume: '45.0 Tons',
    topRegion: 'Malkerns Valley & Shiselweni',
    supplyStatus: 'Tight',
    demandStatus: 'High',
    forecast: 'Dry transition season tightening un-irrigated grain stocks.',
    history: [
      { month: 'May', price: 9.5 },
      { month: 'Jun', price: 10 },
      { month: 'Jul', price: 10.5 },
      { month: 'Aug', price: 11 },
      { month: 'Sep', price: 11.5 },
      { month: 'Oct', price: 12 }
    ]
  },
  {
    id: 'beef',
    name: 'Grass-fed Beef',
    category: 'livestock',
    unit: 'kg',
    currentPrice: 70,
    prevPrice: 70,
    changePercent: 0,
    trend: 'stable',
    volume: '9.8 Tons',
    topRegion: 'Mbabane & Manzini Abattoirs',
    supplyStatus: 'Balanced',
    demandStatus: 'Steady',
    forecast: 'Consistent institutional butchery orders across Mbabane.',
    history: [
      { month: 'May', price: 65 },
      { month: 'Jun', price: 68 },
      { month: 'Jul', price: 68 },
      { month: 'Aug', price: 70 },
      { month: 'Sep', price: 70 },
      { month: 'Oct', price: 70 }
    ]
  },
  {
    id: 'eggs',
    name: 'Free Range Jumbo Eggs',
    category: 'poultry',
    unit: 'dozen',
    currentPrice: 40,
    prevPrice: 38,
    changePercent: +5.2,
    trend: 'rising',
    volume: '8.4 Dozen',
    topRegion: 'Piggs Peak & Hhohho',
    supplyStatus: 'Moderate',
    demandStatus: 'Very High',
    forecast: 'Increased demand from urban bakeries and commercial vendors.',
    history: [
      { month: 'May', price: 34 },
      { month: 'Jun', price: 35 },
      { month: 'Jul', price: 36 },
      { month: 'Aug', price: 38 },
      { month: 'Sep', price: 39 },
      { month: 'Oct', price: 40 }
    ]
  },
  {
    id: 'carrots',
    name: 'Crisp Orange Carrots',
    category: 'vegetables',
    unit: 'kg',
    currentPrice: 10,
    prevPrice: 10.5,
    changePercent: -4.7,
    trend: 'falling',
    volume: '18.1 Tons',
    topRegion: 'Manzini South & Matsanjeni',
    supplyStatus: 'High',
    demandStatus: 'Moderate',
    forecast: 'Good harvests from Matsanjeni farms providing steady supply.',
    history: [
      { month: 'May', price: 12 },
      { month: 'Jun', price: 11.5 },
      { month: 'Jul', price: 11 },
      { month: 'Aug', price: 10.5 },
      { month: 'Sep', price: 10 },
      { month: 'Oct', price: 10 }
    ]
  }
];

// Eswatini Weather Forecast Sample Dataset for Weather API Widget
const ESWATINI_REGIONAL_WEATHER = [
  { region: 'Manzini Hub', temp: '24°C', condition: 'Partly Sunny', humidity: '58%', rainfallProb: '15%', soilMoisture: 'Good', icon: 'CloudSun' },
  { region: 'Malkerns Valley', temp: '23°C', condition: 'Scattered Showers', humidity: '65%', rainfallProb: '45%', soilMoisture: 'Optimal', icon: 'CloudSun' },
  { region: 'Piggs Peak (Hhohho)', temp: '20°C', condition: 'Clear Skies', humidity: '50%', rainfallProb: '5%', soilMoisture: 'Moderate', icon: 'CloudSun' },
  { region: 'Shiselweni Highveld', temp: '21°C', condition: 'Mild Rains', humidity: '70%', rainfallProb: '60%', soilMoisture: 'High', icon: 'CloudSun' }
];

export default function MarketTrendsPage() {
  const { user } = useApp();
  
  const userTier = user?.subscription_tier || 'free';
  const hasAccess = userTier === 'premium' || userTier === 'investor' || user?.role === 'admin' || user?.role === 'buyer';

  const [selectedCropId, setSelectedCropId] = useState('spinach');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCrop = ESWATINI_CROP_TRENDS.find(c => c.id === selectedCropId) || ESWATINI_CROP_TRENDS[0];

  const filteredCrops = ESWATINI_CROP_TRENDS.filter(crop => {
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
    const matchesQuery = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         crop.topRegion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Calculate SVG Points for SVG Line Chart
  const minPrice = Math.min(...selectedCrop.history.map(h => h.price)) * 0.85;
  const maxPrice = Math.max(...selectedCrop.history.map(h => h.price)) * 1.15;
  
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 35;

  const points = selectedCrop.history.map((item, idx) => {
    const x = padding + (idx / (selectedCrop.history.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((item.price - minPrice) / (maxPrice - minPrice)) * (svgHeight - padding * 2);
    return { x, y, price: item.price, month: item.month };
  });

  const pathD = points.reduce((acc, point, i) => 
    i === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`, ''
  );

  const areaD = `${pathD} L ${points[points.length - 1].x},${svgHeight - padding} L ${points[0].x},${svgHeight - padding} Z`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8 animate-fade-in">
      
      {/* HEADER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-forest/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>ESWATINI AGRI-ANALYTICS & COMMODITY INTELLIGENCE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Real-Time Produce Prices & Regional Market Trends
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track commodity price fluctuations, supply-demand indices across Manzini, Hhohho, Shiselweni & Lubombo, and access seasonal planting forecasts.
            </p>
          </div>

          {/* Quick Access Pill / Status */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 space-y-2 shrink-0 max-w-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Access Tier</span>
              <span className={`font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full ${
                hasAccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {hasAccess ? 'Pro Analytics Unlocked' : 'Free Teaser Mode'}
              </span>
            </div>
            <div className="text-xs text-slate-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Updated daily from local markets</span>
            </div>
            {!hasAccess && (
              <Link
                to="/subscriptions"
                className="mt-2 block w-full text-center py-2 px-3 bg-brand-forest hover:bg-brand-dark text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Upgrade to Pro Trends →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* WEATHER & CLIMATE API INTELLIGENCE WIDGET */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Eswatini Agricultural Climate & Rainfall Forecast</h2>
              <p className="text-xs text-slate-500">Live regional weather & soil conditions affecting harvest dispatch</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Weather API Integration Ready (Eswatini Met Services)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ESWATINI_REGIONAL_WEATHER.map((w, idx) => (
            <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2 hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{w.region}</span>
                </span>
                <span className="font-extrabold text-slate-900 text-sm">{w.temp}</span>
              </div>

              <div className="text-xs text-slate-600 font-medium flex items-center justify-between">
                <span>{w.condition}</span>
                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">
                  Rain: {w.rainfallProb}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                <div>Humidity: <strong className="text-slate-800">{w.humidity}</strong></div>
                <div>Soil: <strong className="text-slate-800">{w.soilMoisture}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE PRICE TREND VISUAL GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* GRAPH & DETAILED CHART (LEFT 2 COLUMNS) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-brand-forest" />
                <h2 className="text-lg font-extrabold text-slate-900">Historical Price Movement (May - Oct 2026)</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Showing monthly wholesale prices per {selectedCrop.unit} in Eswatini markets.</p>
            </div>

            {/* Crop Selector Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
              {ESWATINI_CROP_TRENDS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCropId(c.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    selectedCropId === c.id
                      ? 'bg-brand-forest text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Price Line Graph */}
          <div className="relative bg-slate-900 text-white rounded-2xl p-4 sm:p-6 space-y-4 overflow-hidden border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{selectedCrop.topRegion}</span>
                <div className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                  <span>{selectedCrop.name}</span>
                  <span className="text-brand-forest">E{selectedCrop.currentPrice}/{selectedCrop.unit}</span>
                </div>
              </div>

              <div className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center space-x-1 ${
                selectedCrop.trend === 'rising' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                selectedCrop.trend === 'falling' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                'bg-slate-700 text-slate-300'
              }`}>
                {selectedCrop.trend === 'rising' && <ArrowUpRight className="w-4 h-4 text-rose-400" />}
                {selectedCrop.trend === 'falling' && <ArrowDownRight className="w-4 h-4 text-emerald-400" />}
                <span className="capitalize">{selectedCrop.trend} ({selectedCrop.changePercent > 0 ? `+${selectedCrop.changePercent}%` : `${selectedCrop.changePercent}%`})</span>
              </div>
            </div>

            {/* Custom Interactive SVG Line Chart */}
            <div className="relative pt-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0.2, 0.5, 0.8].map((ratio, i) => (
                  <line 
                    key={i} 
                    x1={padding} 
                    y1={svgHeight * ratio} 
                    x2={svgWidth - padding} 
                    y2={svgHeight * ratio} 
                    stroke="#334155" 
                    strokeDasharray="4 4" 
                    strokeWidth="1" 
                  />
                ))}

                {/* Filled gradient area below line */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Line Path */}
                <path d={pathD} fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={pt.x} cy={pt.y} r="5" className="fill-emerald-400 stroke-slate-900 stroke-2 group-hover:r-7 transition-all" />
                    {/* Hover Value Label */}
                    <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#FFFFFF" className="text-[10px] font-extrabold opacity-80 group-hover:opacity-100">
                      E{pt.price}
                    </text>
                    {/* Month Label */}
                    <text x={pt.x} y={svgHeight - 10} textAnchor="middle" fill="#94A3B8" className="text-[11px] font-semibold">
                      {pt.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* AI Crop Forecast Message */}
            <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold">Eswatini Market Outlook: </strong>
                <span>{selectedCrop.forecast}</span>
              </div>
            </div>

          </div>

          {/* REGIONAL SUPPLY & DEMAND ANALYSIS WIDGET */}
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-700">
              Regional Supply vs Demand Index
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-emerald-950">
                  <span>Supply Volume</span>
                  <span className="text-emerald-700">{selectedCrop.supplyStatus}</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: selectedCrop.supplyStatus === 'Surplus' ? '90%' : selectedCrop.supplyStatus === 'High' ? '75%' : '45%' }}
                  ></div>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium">Estimated trade volume: <strong>{selectedCrop.volume}</strong></p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-amber-950">
                  <span>Buyer Demand Index</span>
                  <span className="text-amber-700">{selectedCrop.demandStatus}</span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: selectedCrop.demandStatus === 'Very High' ? '95%' : selectedCrop.demandStatus === 'High' ? '80%' : '55%' }}
                  ></div>
                </div>
                <p className="text-[11px] text-amber-900 font-medium">Top Hub: <strong>{selectedCrop.topRegion}</strong></p>
              </div>
            </div>
          </div>

        </div>

        {/* COMMODITY TABLE & FILTER SIDEBAR (RIGHT COLUMN) */}
        <div className="space-y-6">
          
          {/* SEARCH & CATEGORY FILTER */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <Filter className="w-4 h-4 text-brand-forest" />
              <span>Filter Produce Trends</span>
            </h3>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crop or Inkhundla..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-forest"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {['all', 'vegetables', 'grains', 'livestock', 'poultry'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* COMMODITY LIST CARDS */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 px-1">
              Eswatini Crop Price Index ({filteredCrops.length})
            </h3>

            {filteredCrops.map(crop => (
              <div 
                key={crop.id}
                onClick={() => setSelectedCropId(crop.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedCropId === crop.id
                    ? 'bg-emerald-50/70 border-brand-forest shadow-xs ring-1 ring-brand-forest/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{crop.topRegion.split(' ')[0]}</span>
                  </span>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    crop.trend === 'rising' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    crop.trend === 'falling' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {crop.trend === 'rising' && <TrendingUp className="w-3 h-3 text-rose-600" />}
                    {crop.trend === 'falling' && <TrendingDown className="w-3 h-3 text-emerald-600" />}
                    <span className="capitalize">{crop.trend}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{crop.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Volume: {crop.volume}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-brand-forest">E{crop.currentPrice}</div>
                    <span className="text-[10px] text-slate-400 font-medium">per {crop.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* SEASONAL ADVICE & CALENDAR SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Eswatini Seasonal Farming Advice & Harvesting Calendar</h2>
            <p className="text-xs text-slate-500">Curated guidelines for smallholders and commercial producers in Eswatini.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_SEASONAL_TIPS.map((tip) => (
            <div key={tip.id} className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2 hover:bg-amber-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-950 text-xs flex items-center space-x-1">
                  <Sprout className="w-4 h-4 text-amber-700" />
                  <span>{tip.product_type}</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {tip.region}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{tip.tip_text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
