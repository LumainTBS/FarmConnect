import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Star, CheckCircle, MapPin, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RecommendedFarmersPage() {
  const { farmers } = useApp();

  // Compute recommended leaderboard score formula per Section 4.3
  const scoredFarmers = farmers.map(f => {
    const normSold = Math.min(1.0, f.goods_sold / 500);
    const normRating = (f.rating - 1) / 4;
    const normResp = f.response_rate / 100;
    const score = (0.4 * normSold) + (0.4 * normRating) + (0.2 * normResp);
    return { ...f, score: Math.round(score * 100) };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white space-y-2 shadow-md">
        <div className="flex items-center space-x-2">
          <Award className="w-6 h-6 text-amber-200" />
          <h1 className="text-2xl font-bold tracking-tight">Recommended Farmers Leaderboard</h1>
        </div>
        <p className="text-xs text-amber-100 max-w-xl leading-relaxed">
          Ranked by verified platform performance data including confirmed sales, buyer ratings, and enquiry response rates across Eswatini.
        </p>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {scoredFarmers.map((farmer, index) => (
          <div 
            key={farmer.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Rank Medal */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                index === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                index === 1 ? 'bg-slate-200 text-slate-800' :
                index === 2 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                #{index + 1}
              </div>

              <img 
                src={farmer.avatar} 
                alt={farmer.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600 shrink-0" 
              />

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-slate-900 text-base truncate">{farmer.name}</h3>
                  {farmer.is_verified && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{farmer.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium pt-1">
                  <span className="text-amber-600 font-bold">★ {farmer.rating}</span>
                  <span>•</span>
                  <span>{farmer.goods_sold} items sold</span>
                  <span>•</span>
                  <span>{farmer.response_rate}% response rate</span>
                </div>
              </div>
            </div>

            {/* Score & View Profile */}
            <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-lg font-extrabold text-brand-forest">{farmer.score} pts</div>
              </div>
              <Link
                to={`/farmer/${farmer.id}`}
                className="px-4 py-2 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-dark transition-colors flex items-center space-x-1 shadow-xs"
              >
                <span>Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
