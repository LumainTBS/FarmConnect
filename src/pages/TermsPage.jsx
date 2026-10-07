import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldCheck, CheckCircle2, ArrowLeft, Cookie } from 'lucide-react';

export default function TermsPage() {
  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookiePreferences'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      
      {/* Header Banner */}
      <div 
        className="relative rounded-3xl overflow-hidden text-white p-8 sm:p-12 shadow-xl border border-emerald-700/40"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(7, 35, 20, 0.94) 0%, rgba(13, 74, 43, 0.86) 55%, rgba(6, 40, 24, 0.90) 100%), url('/images/farmconnect-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 space-y-3 max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-white text-xs font-semibold mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Official Policy Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service & Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Standards of fair trade, data security, produce grading, and digital marketplace regulations across the Kingdom of Eswatini.
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm shadow-xs">
        
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-2">
          <div className="font-bold flex items-center gap-2 text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Eswatini Agricultural Fair Trade Standard</span>
          </div>
          <p className="text-xs text-emerald-800">
            Farm Connect is dedicated to eliminating exploitative middleman fees, enabling local smallholders to earn honest market prices, and giving buyers direct traceability to fresh kingdom harvests.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            1. Farmer Listing & Produce Quality Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Registered smallholders and commercial producers must provide truthful representations of crop harvest dates, available quantities, packaging units, and geographic origin (Inkhundla / Chiefdom). Produce listed as available must be ready for timely collection or dispatch.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            2. Orders, Regional Pickups & Payments
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Orders placed on the platform establish a binding harvest reserve. Transactions may be settled through supported payment methods including MTN MoMo, Eswatini Mobile e-Mali, Instant EFT, or Cash on Delivery at recognized regional landmark centers (e.g. Manzini Market, Matsapha, Mbabane).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            3. ID Verification & Document Privacy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Eswatini National IDs and proof of residency documents submitted for verification are securely encrypted. Personal identity records are used solely by Farm Connect compliance personnel for trust validation and are never sold or disclosed to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            4. Cookie Consent & Data Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            We store essential session cookies necessary for shopping cart preservation, user authentication, and order security. You can adjust your analytics or marketing preferences at any time.
          </p>
          <button
            onClick={handleOpenCookieSettings}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Cookie className="w-4 h-4 text-emerald-700" />
            <span>Open Cookie Preferences</span>
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            5. Dispute Resolution & Customer Support
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            If a harvest order fails to meet quality expectations or quantity specifications, buyers can notify our team within 24 hours. Our regional coordinators mediate to ensure fair resolution, replacement produce, or credit reimbursement.
          </p>
        </section>

      </div>

    </div>
  );
}
