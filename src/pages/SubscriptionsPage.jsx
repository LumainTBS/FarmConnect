import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, X, Sparkles, Zap, ShieldCheck, ArrowRight, 
  TrendingUp, Package, Percent, HelpCircle, Phone, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_TIERS } from '../lib/supabase';

export default function SubscriptionsPage() {
  const { user, upgradeSubscription, listings } = useApp();
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [momoNumber, setMomoNumber] = useState(user?.phone_number || '+268 76');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const currentTierId = user?.subscription_tier || 'free';
  const currentTier = SUBSCRIPTION_TIERS[currentTierId] || SUBSCRIPTION_TIERS.free;

  const handleOpenUpgrade = (tierKey) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (tierKey === currentTierId) return;
    setSelectedTier(SUBSCRIPTION_TIERS[tierKey]);
  };

  const handleConfirmUpgrade = async (e) => {
    e.preventDefault();
    if (!selectedTier) return;

    setIsProcessing(true);
    // Simulate payment gateway delay (e.g. MTN MoMo prompt)
    setTimeout(async () => {
      await upgradeSubscription(selectedTier.id, {
        paymentMethod: paymentMethod === 'momo' ? 'MTN Mobile Money (MoMo)' : 'Credit/Debit Card',
        momoNumber
      });
      setIsProcessing(false);
      setSelectedTier(null);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-10">
      
      {/* HEADER HERO */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>FARM CONNECT PLANS & MONETIZATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Scale Your Produce Sales in Eswatini
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Unlock higher listing limits, lowest transaction commission fees, and real-time market trend intelligence.
        </p>

        {user && user.role === 'farmer' && (
          <div className="inline-block mt-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-700">
            You are currently on the <strong className="text-brand-forest font-bold">{currentTier.name}</strong> ({currentTier.maxListings === 9999 ? 'Unlimited' : currentTier.maxListings} Listings Quota • {currentTier.commissionLabel} commission).
          </div>
        )}
      </div>

      {/* 4 TIERS PRICING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          const isCurrent = currentTierId === key;
          const isPopular = tier.popular;

          return (
            <div
              key={key}
              className={`relative bg-white rounded-3xl border transition-all flex flex-col justify-between ${
                isPopular 
                  ? 'border-brand-forest shadow-xl ring-2 ring-brand-forest/20' 
                  : isCurrent
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200/90 shadow-sm hover:shadow-md'
              } p-6`}
            >
              {/* Top Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-forest text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              {isCurrent && !isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Active Plan
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">{tier.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tier.badgeColor}`}>
                      {tier.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{tier.description}</p>
                </div>

                {/* Price Display */}
                <div className="py-2 border-y border-slate-100">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {tier.price === 0 ? 'Free' : `E${tier.price}`}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {tier.price === 0 ? 'Forever' : tier.billingPeriod}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-emerald-700 font-semibold">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{tier.commissionLabel} Platform Fee</span>
                  </div>
                </div>

                {/* Core Features List */}
                <div className="space-y-2.5 text-xs">
                  <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                    Plan Highlights
                  </div>
                  
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{tier.maxListings === 9999 ? 'Unlimited' : `Up to ${tier.maxListings}`}</strong> active listings
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-700">
                    {tier.marketTrendsAccess ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-emerald-900">Market Trends Unlocked</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-400">Market Trends Locked</span>
                      </>
                    )}
                  </div>

                  {tier.features.slice(2).map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-600">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl cursor-default text-center"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenUpgrade(key)}
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                      isPopular
                        ? 'bg-brand-forest hover:bg-brand-dark text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{tier.price === 0 ? 'Switch to Free' : `Subscribe for E${tier.price}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPARISON TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Feature Matrix & Comparison</h2>
          <p className="text-xs text-slate-500 mt-1">Detailed comparison across all 4 Farm Connect subscription tiers.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="py-3 px-4 font-bold text-slate-700">Capability</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-center">Free Tier</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-center">Basic (E50)</th>
                <th className="py-3 px-4 font-bold text-brand-forest text-center">Premium (E150)</th>
                <th className="py-3 px-4 font-bold text-amber-700 text-center">Investor (E350)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Max Active Produce Listings</td>
                <td className="py-3 px-4 text-center text-slate-600">3 Listings</td>
                <td className="py-3 px-4 text-center text-slate-600">10 Listings</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-800">30 Listings</td>
                <td className="py-3 px-4 text-center font-bold text-amber-800">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Platform Commission Fee</td>
                <td className="py-3 px-4 text-center text-slate-600">5.0% per order</td>
                <td className="py-3 px-4 text-center text-slate-600">4.0% per order</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-800">2.5% per order</td>
                <td className="py-3 px-4 text-center font-bold text-amber-800">1.0% per order</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Market Trends & Price Forecasting</td>
                <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                <td className="py-3 px-4 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto text-emerald-600" /></td>
                <td className="py-3 px-4 text-center text-amber-600"><Check className="w-4 h-4 mx-auto text-amber-600" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Direct In-App Messaging & WhatsApp</td>
                <td className="py-3 px-4 text-center text-slate-600">Standard</td>
                <td className="py-3 px-4 text-center text-slate-600">WhatsApp Badge</td>
                <td className="py-3 px-4 text-center text-emerald-800 font-semibold">Priority Inbox</td>
                <td className="py-3 px-4 text-center text-amber-800 font-semibold">Dedicated Channel</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Private Crop & Plant Logs</td>
                <td className="py-3 px-4 text-center text-slate-600">Included</td>
                <td className="py-3 px-4 text-center text-slate-600">Included</td>
                <td className="py-3 px-4 text-center text-emerald-800 font-semibold">Unlimited</td>
                <td className="py-3 px-4 text-center text-amber-800 font-semibold">Unlimited + Export</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Leaderboard & Recommended Placement</td>
                <td className="py-3 px-4 text-center text-slate-600">Standard</td>
                <td className="py-3 px-4 text-center text-slate-600">Standard</td>
                <td className="py-3 px-4 text-center text-emerald-800 font-semibold">Boosted Rank</td>
                <td className="py-3 px-4 text-center text-amber-800 font-bold">Featured Top Spotlight</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upgrade Subscription</h3>
                <p className="text-xs text-slate-500">Instant activation on Eswatini Mobile Money</p>
              </div>
              <button
                onClick={() => setSelectedTier(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Tier Summary */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase text-emerald-800">{selectedTier.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {selectedTier.maxListings === 9999 ? 'Unlimited Listings' : `${selectedTier.maxListings} Listings`} • {selectedTier.commissionLabel} commission
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-slate-900">E{selectedTier.price}</div>
                <div className="text-[10px] text-slate-500">per month</div>
              </div>
            </div>

            <form onSubmit={handleConfirmUpgrade} className="space-y-4">
              
              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Choose Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      paymentMethod === 'momo'
                        ? 'border-brand-forest bg-emerald-50/50 text-brand-forest ring-1 ring-brand-forest'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></div>
                      <span>MTN MoMo</span>
                    </div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">+268 Mobile Prompt</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-brand-forest bg-emerald-50/50 text-brand-forest ring-1 ring-brand-forest'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                      <span>Bank Card</span>
                    </div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">Visa / Mastercard</div>
                  </button>
                </div>
              </div>

              {/* MoMo Number Field */}
              {paymentMethod === 'momo' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">MTN Mobile Money Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="+268 7612 3456"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-brand-forest"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    A prompt will be sent to your handset to authorize the monthly charge of E{selectedTier.price}.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Card Number (4000 1234 5678 9010)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-brand-forest"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-brand-forest"
                    />
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="CVV"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-brand-forest"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedTier(null)}
                  className="w-1/2 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-brand-forest hover:bg-brand-dark rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-sm"
                >
                  {isProcessing ? (
                    <span>Processing...</span>
                  ) : (
                    <span>Confirm E{selectedTier.price}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
