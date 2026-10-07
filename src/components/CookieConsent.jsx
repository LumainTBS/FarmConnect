import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, Settings2, ExternalLink } from 'lucide-react';
import TermsModal from './TermsModal';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('farmconnect_cookie_consent');
    if (!savedConsent) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(savedConsent));
      } catch (e) {
        // fallback
      }
    }

    // Listen for custom event from footer/account to re-open cookie preferences
    const handleOpenCookies = () => {
      setShowPreferences(true);
    };
    window.addEventListener('openCookiePreferences', handleOpenCookies);
    return () => window.removeEventListener('openCookiePreferences', handleOpenCookies);
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('farmconnect_cookie_consent', JSON.stringify(fullConsent));
    setPreferences(fullConsent);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleRejectNonEssential = () => {
    const minimalConsent = { essential: true, analytics: false, marketing: false };
    localStorage.setItem('farmconnect_cookie_consent', JSON.stringify(minimalConsent));
    setPreferences(minimalConsent);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('farmconnect_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferences(false);
  };

  return (
    <>
      {/* FLOATING COOKIE CONSENT BANNER */}
      {isVisible && !showPreferences && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-slide-up">
          <div className="bg-[#072314]/95 text-white backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Cookie & Privacy Preferences</h3>
                  <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Kingdom of Eswatini</span>
                </div>
              </div>
              <button 
                onClick={handleRejectNonEssential}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
              Farm Connect uses essential cookies to authenticate your sessions, safeguard orders, and analyze harvest traffic across Eswatini regions.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                Decline Non-Essential
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-3 py-2.5 text-emerald-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
            </div>

            <div className="text-[11px] text-emerald-300/80 pt-1 border-t border-emerald-800/60 flex items-center justify-between">
              <span>Read our policy:</span>
              <button
                onClick={() => setShowTermsModal(true)}
                className="underline hover:text-white font-semibold cursor-pointer"
              >
                Terms & Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE COOKIE PREFERENCES MODAL */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Manage Cookie Preferences</h3>
                  <p className="text-xs text-slate-500">Tailor your data and tracking choices on Farm Connect Eswatini.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreferences(false);
                  setIsVisible(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* Essential Cookies */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Strictly Necessary Cookies</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Required for core marketplace functions like user authentication, shopping cart persistence, and secure checkout payments.
                </p>
              </div>

              {/* Analytics & Performance */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">
                    Analytics & Regional Performance
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Helps us analyze popular vegetable demand trends and improve delivery route performance across Manzini and Hhohho.
                </p>
              </div>

              {/* Marketing & Special Promotions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">
                    Marketing & Harvest Rebate Alerts
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enables personalized bulk volume discounts, SMS/WhatsApp harvest alerts, and seasonal farmer seedling promotions.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-xs text-brand-forest hover:underline font-semibold flex items-center gap-1"
              >
                <span>Read Full Terms & Policy</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-dark text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS MODAL */}
      {showTermsModal && (
        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      )}
    </>
  );
}
