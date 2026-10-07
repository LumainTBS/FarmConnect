import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FarmersDirectoryPage() {
  const { farmers } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farmers Directory</h1>
        <p className="text-xs text-slate-500">Discover verified local agricultural producers across Eswatini regions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farmers.map((farmer) => (
          <div 
            key={farmer.id}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Cover Banner */}
            <div className="h-24 w-full relative bg-slate-100">
              <img src={farmer.cover} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{farmer.rating} ({farmer.reviews_count})</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4 pt-0 relative space-y-3 flex-1">
              <div className="-mt-7 mb-2 flex items-end justify-between">
                <img 
                  src={farmer.avatar} 
                  alt={farmer.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0" 
                />
                {farmer.is_verified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{farmer.name}</h3>
                <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{farmer.location}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {farmer.about}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {farmer.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="p-4 pt-0">
              <Link
                to={`/farmer/${farmer.id}`}
                className="w-full py-2.5 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-dark transition-colors flex items-center justify-center space-x-1"
              >
                <span>View Farm Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
