import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-bounce-short">
      <div className={`flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm font-medium ${
        isError 
          ? 'bg-rose-950 text-rose-100 border-rose-800' 
          : isInfo 
          ? 'bg-slate-900 text-slate-100 border-slate-700' 
          : 'bg-[#0D4A2B] text-white border-emerald-700'
      }`}>
        <div className="flex items-center space-x-2.5">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : isInfo ? (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      </div>
    </div>
  );
}
