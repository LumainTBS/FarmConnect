import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, Star, CheckCircle, MapPin, ArrowRight, ShieldCheck, 
  TrendingUp, Sparkles, Filter, Lock, Trophy, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RecommendedFarmersPage() {
  const { farmers, listings } = useApp();
  const [selectedTier, setSelectedTier] = useState('all'); // 'all' | 'diamond' | 'gold' | 'silver'

  // Calculate produce count and verified score for every farmer
  const processedFarmers = farmers.map(f => {
    const farmerListingsCount = listings.filter(l => l.farmer_id === f.id || l.farmerId === f.id || (l.farmer_name && l.farmer_name.toLowerCase() === f.name.toLowerCase())).length;
    const effectiveProduceVolume = Math.max(Number(f.goods_sold) || 0, farmerListingsCount * 10);
    
    // Performance score formula
    const normSold = Math.min(1.0, effectiveProduceVolume / 500);
    const normRating = ((f.rating || 5.0) - 1) / 4;
    const normResp = (f.response_rate || 95) / 100;
    const score = Math.round(((0.4 * normSold) + (0.4 * normRating) + (0.2 * normResp)) * 100);

    // Rating tier classification
    let tier = 'silver';
    let tierName = 'Silver Tier';
    let tierBadge = 'bg-slate-100 text-slate-800 border-slate-300';
    if ((f.rating || 5.0) >= 4.8) {
      tier = 'diamond';
      tierName = 'Diamond Master';
      tierBadge = 'bg-cyan-50 text-cyan-900 border-cyan-300';
    } else if ((f.rating || 5.0) >= 4.5) {
      tier = 'gold';
      tierName = 'Gold Champion';
      tierBadge = 'bg-amber-50 text-amber-900 border-amber-300';
    }

    // Qualification rule: 20+ produce volume required to enter official Leaderboard
    const isQualified = effectiveProduceVolume >= 20;

    return {
      ...f,
      score,
      tier,
      tierName,
      tierBadge,
      effectiveProduceVolume,
      isQualified,
      progressToLeaderboard: Math.min(100, Math.round((effectiveProduceVolume / 20) * 100))
    };
  }).sort((a, b) => b.score - a.score || b.effectiveProduceVolume - a.effectiveProduceVolume);

  // Divide into Qualified Leaderboard vs Emerging (Working Process)
  const qualifiedFarmers = processedFarmers.filter(f => f.isQualified);
  const emergingFarmers = processedFarmers.filter(f => !f.isQualified);

  // Filter qualified by selected rating tier
  const displayedQualified = qualifiedFarmers.filter(f => {
    if (selectedTier === 'all') return true;
    return f.tier === selectedTier;
  });

  // Top 4 Priority Podium
  const topFourFarmers = qualifiedFarmers.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* HEADER BANNER (Liquid Glass) */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 text-white shadow-xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-emerald-300 text-xs font-bold tracking-wider uppercase">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Official Producer Rankings &middot; Kingdom of Eswatini</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Farmer Leaderboard & Performance Tiers
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Directly recognizing the top 4 certified producers and rated growers across Eswatini. Farmers unlock official Leaderboard placement upon listing or selling 20+ produce items.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0 self-start md:self-auto space-y-1">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Qualification Bar</div>
            <div className="text-xl sm:text-2xl font-black text-white">20+ Produce</div>
            <div className="text-[10px] text-slate-300">Min. harvest activity required</div>
          </div>
        </div>
      </div>

      {/* TOP 4 PRIORITY PODIUM SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Premier Top 4 Producers</h2>
          </div>
          <span className="text-xs text-slate-500">Highest rated & volume confirmed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topFourFarmers.map((farmer, idx) => {
            const podiumMedals = ['bg-amber-400 text-slate-950', 'bg-slate-300 text-slate-900', 'bg-amber-700 text-white', 'bg-emerald-600 text-white'];
            return (
              <div 
                key={farmer.id}
                className="relative bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img 
                      src={farmer.avatar} 
                      alt={farmer.name} 
                      className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-500/40"
                    />
                    <span className={`absolute -top-2 -left-2 w-6 h-6 rounded-md font-black text-xs flex items-center justify-center shadow-xs ${podiumMedals[idx] || 'bg-slate-800 text-white'}`}>
                      #{idx + 1}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${farmer.tierBadge}`}>
                    {farmer.tierName}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-brand-forest transition-colors">
                      {farmer.name}
                    </h3>
                    {farmer.is_verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{farmer.location || 'Manzini Region'}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-amber-600 font-bold">★ {farmer.rating}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({farmer.effectiveProduceVolume} sold)</span>
                  </div>
                  <div className="font-extrabold text-brand-forest text-sm">
                    {farmer.score} pts
                  </div>
                </div>

                <Link
                  to={`/farmer/${farmer.id}`}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-brand-forest text-white text-xs font-bold transition-colors text-center block"
                >
                  View Profile & Stock
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* RATING TIER FILTER TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-2.5 flex items-center gap-2 overflow-x-auto shadow-xs">
        <span className="text-xs font-bold text-slate-500 px-3 hidden sm:inline">Filter by Tier:</span>
        <button
          onClick={() => setSelectedTier('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            selectedTier === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Qualified ({qualifiedFarmers.length})
        </button>
        <button
          onClick={() => setSelectedTier('diamond')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            selectedTier === 'diamond'
              ? 'bg-cyan-600 text-white'
              : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
          }`}
        >
          Diamond Tier (4.8+ Rating)
        </button>
        <button
          onClick={() => setSelectedTier('gold')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            selectedTier === 'gold'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Gold Tier (4.5 - 4.7)
        </button>
        <button
          onClick={() => setSelectedTier('silver')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            selectedTier === 'silver'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Silver Tier (4.0 - 4.4)
        </button>
      </div>

      {/* COMPLETE QUALIFIED LEADERBOARD LIST */}
      <div className="space-y-3">
        {displayedQualified.map((farmer, index) => (
          <div 
            key={farmer.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-emerald-400 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-sm flex items-center justify-center shrink-0 border border-slate-200">
                #{index + 1}
              </div>

              <img 
                src={farmer.avatar} 
                alt={farmer.name} 
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
              />

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-base truncate">{farmer.name}</h3>
                  {farmer.is_verified && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${farmer.tierBadge}`}>
                    {farmer.tierName}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{farmer.location || 'Manzini Region'}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium pt-1">
                  <span className="text-amber-600 font-bold">★ {farmer.rating}</span>
                  <span>•</span>
                  <span>{farmer.effectiveProduceVolume} verified produce sold</span>
                  <span>•</span>
                  <span>{farmer.response_rate || 98}% response rate</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-lg font-black text-brand-forest">{farmer.score} pts</div>
              </div>
              <Link
                to={`/farmer/${farmer.id}`}
                className="px-4 py-2 rounded-xl bg-brand-forest hover:bg-brand-dark text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <span>Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* WORKING PROCESS / EMERGING PRODUCERS SECTION (< 20 PRODUCE) */}
      <div className="bg-slate-50/80 rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-slate-800">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Emerging Farmers &middot; In Working Process</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Farmers actively onboarding or working toward the 20-produce threshold to unlock public Leaderboard status.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 shrink-0 self-start sm:self-auto">
            {emergingFarmers.length} Growing Farmers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {emergingFarmers.length === 0 ? (
            <div className="col-span-2 text-center py-6 text-xs text-slate-500">
              All registered farmers have met the 20-produce qualification threshold!
            </div>
          ) : (
            emergingFarmers.map(farmer => (
              <div 
                key={farmer.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img 
                    src={farmer.avatar} 
                    alt={farmer.name} 
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0" 
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{farmer.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{farmer.location || 'Eswatini'}</p>
                    <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${farmer.progressToLeaderboard}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-600 block">
                    {farmer.effectiveProduceVolume} / 20 Produce
                  </span>
                  <span className="text-[10px] text-amber-600 font-semibold">
                    {20 - farmer.effectiveProduceVolume} more to qualify
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
