import React, { useState } from 'react';
import { Sprout, ShoppingBag, CheckCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function RoleSelectionModal({ isOpen, onClose }) {
  const { user, updateUserProfile, showToast, switchRole } = useApp();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleConfirmRole = async () => {
    if (!selectedRole || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Update in Supabase
      const { error } = await supabase
        .from('users')
        .update({ 
          role: selectedRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.warn('Role update notice:', error.message);
      }

      // 2. Persist in localStorage and update app state
      localStorage.setItem(`farmconnect_role_selected_${user.id}`, 'true');
      
      await updateUserProfile({
        role: selectedRole,
        role_selected: true
      });

      showToast(`Welcome! You are now set up as a ${selectedRole === 'farmer' ? 'Local Farmer' : 'Produce Buyer'}.`, 'success');
      onClose();
    } catch (err) {
      console.error('Failed to set role:', err);
      showToast('Error setting account type. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>WELCOME TO FARM CONNECT ESWATINI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How will you use Farm Connect?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose your account type to personalize your experience. You can switch modes anytime from account settings.
          </p>
        </div>

        {/* Role Cards Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* OPTION 1: BUYER */}
          <button
            type="button"
            onClick={() => setSelectedRole('buyer')}
            className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
              selectedRole === 'buyer'
                ? 'border-brand-forest bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            {selectedRole === 'buyer' && (
              <span className="absolute top-3 right-3 text-brand-forest">
                <CheckCircle className="w-5 h-5 fill-emerald-600 text-white" />
              </span>
            )}
            
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Produce Buyer</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                I want to buy fresh vegetables, fruits, poultry, and grains directly from local farmers at transparent prices.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100/80 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Direct farmer ordering & chat</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>MTN MoMo & card payment</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Wholesale crate inquiries</span>
              </div>
            </div>
          </button>

          {/* OPTION 2: FARMER */}
          <button
            type="button"
            onClick={() => setSelectedRole('farmer')}
            className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
              selectedRole === 'farmer'
                ? 'border-brand-forest bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            {selectedRole === 'farmer' && (
              <span className="absolute top-3 right-3 text-brand-forest">
                <CheckCircle className="w-5 h-5 fill-emerald-600 text-white" />
              </span>
            )}

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Local Farmer</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                I am an agricultural producer looking to list my harvests and sell to buyers across Eswatini without middlemen.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100/80 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Publish produce listings</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Buyer restock requests</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Private plant logs & market trends</span>
              </div>
            </div>
          </button>

        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedRole || isSubmitting}
            onClick={handleConfirmRole}
            className="w-full py-3.5 px-6 rounded-2xl bg-brand-forest hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'Setting up your profile...' : `Continue as ${selectedRole ? (selectedRole === 'farmer' ? 'Local Farmer' : 'Produce Buyer') : 'Selected Account'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-[11px] text-center text-slate-400 mt-2">
            By continuing, you agree to Farm Connect Eswatini's Terms of Service and Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );
}
