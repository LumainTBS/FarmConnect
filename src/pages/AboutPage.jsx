import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Users, MapPin, Phone, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-8">
      
      {/* Hero Banner with Head.png & Glassmorphic Accents */}
      <div 
        className="relative rounded-3xl overflow-hidden text-white p-8 sm:p-12 text-center space-y-4 shadow-xl border border-emerald-700/40"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(10, 36, 22, 0.94) 0%, rgba(13, 74, 43, 0.88) 55%, rgba(6, 78, 59, 0.82) 100%), url('/images/Head.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 max-w-xl mx-auto space-y-3">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto object-contain bg-white rounded-2xl p-2 shadow-lg" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About Farm Connect Eswatini</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Building a stronger agricultural community through technology, transparent trade, and direct farmer-buyer connections.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="liquid-glass-card p-6 space-y-2 border border-slate-200/90 shadow-xs">
          <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Sprout className="w-5 h-5 text-brand-forest" />
            <span>Our Mission</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To create a reliable and accessible marketplace that connects Eswatini's farmers and buyers, promotes local agriculture, and strengthens rural communities.
          </p>
        </div>

        <div className="liquid-glass-card p-6 space-y-2 border border-slate-200/90 shadow-xs">
          <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-brand-forest" />
            <span>Our Vision</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A sustainable future where local farmers thrive, communities have direct access to fresh produce, and agriculture drives economic growth in Eswatini.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <h2 className="font-bold text-slate-900 text-base">Key Pillars</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <HeartHandshake className="w-6 h-6 text-brand-forest" />
            <h3 className="font-bold text-xs text-slate-900">Support Local Farmers</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">Fair prices and direct market access for Eswatini agricultural producers.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <Users className="w-6 h-6 text-brand-forest" />
            <h3 className="font-bold text-xs text-slate-900">Promote Local Produce</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">Connecting households and businesses with farm-fresh produce.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <Sprout className="w-6 h-6 text-brand-forest" />
            <h3 className="font-bold text-xs text-slate-900">Build Stronger Communities</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">Enhancing food security through sustainable agricultural innovation.</p>
          </div>
        </div>
      </div>

      {/* Get in Touch */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <h2 className="font-bold text-slate-900 text-base">Get in Touch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-brand-forest" />
            <span>info@farmconnect.sz</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-brand-forest" />
            <span>+268 7612 3456</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-forest" />
            <span>Manzini, Eswatini</span>
          </div>
        </div>
      </div>

    </div>
  );
}
