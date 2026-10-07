import React from 'react';
import { X, ShieldCheck, FileText, Scale, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Terms of Service & Privacy Policy</h2>
              <p className="text-xs text-slate-500">Farm Connect Kingdom of Eswatini &middot; Agricultural Trade Regulations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verified Agricultural Fair Trade Guarantee</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Farm Connect provides an open, transparent digital agricultural exchange bridging smallholder farmers and commercial buyers across the Kingdom of Eswatini.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              1. Farmer Listing & Produce Quality Standards
            </h3>
            <p>
              Registered farmers must accurately represent their crop harvest dates, quantity, unit pricing (in SZL), and geographic Inkhundla origin (e.g. Malkerns, Ezulwini, Lowveld). All listed produce must meet national phytosanitary and freshness standards.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              2. Buyer Orders, Payments & Landmark Pickups
            </h3>
            <p>
              Orders placed on Farm Connect are binding once confirmed by the producer. Payments may be settled via MTN MoMo, Eswatini Mobile e-Mali, Instant EFT, or Cash on Pickup/Delivery at agreed regional landmark hubs (e.g., Manzini Market, Mbabane New Mall, Matsapha Industrial).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              3. ID Verification & Data Privacy
            </h3>
            <p>
              Farmer National IDs and Chiefdom proofs of residency uploaded to the platform are strictly utilized by Farm Connect administrators to prevent fraudulent listings. Personal identity documents are encrypted and never shared with third-party marketers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              4. Cookie Policy & Analytics
            </h3>
            <p>
              We use necessary session cookies to maintain your login status, remember your shopping cart items, and preserve your regional filter preferences. You can customize analytics and marketing cookies at any time via the Cookie Preferences menu in the footer.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              5. Dispute Resolution & Support
            </h3>
            <p>
              If a harvest delivery does not conform to the listing description or quality grade, buyers can lodge a dispute within 24 hours of scheduled collection. Farm Connect regional field coordinators facilitate fair settlement or replenishment.
            </p>
          </section>

        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-[11px] text-slate-500">Last updated: September 2026</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-brand-forest hover:bg-brand-dark text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
}
