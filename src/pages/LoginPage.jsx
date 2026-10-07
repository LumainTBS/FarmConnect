import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const { loginUser, user, authLoading, showToast } = useApp();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-redirect when user is authenticated (fixes Google OAuth return staying on login page)
  React.useEffect(() => {
    if (user && !authLoading) {
      navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (!emailOrPhone.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone.trim(),
        password
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        showToast('Logged in successfully!');
        // Context onAuthStateChange will automatically sync profile and trigger the useEffect navigation
      }
    } catch (err) {
      console.error('Login Error:', err);
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message || 'Google sign in failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Google OAuth Exception:', err);
      setErrorMsg('Google sign in encountered an issue.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Farm Connect" className="w-14 h-14 mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500">Log in to your Farm Connect account to continue.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email or Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g. +268 7612 3456 or name@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <button 
                type="button" 
                className="text-xs font-medium text-brand-forest hover:underline"
                onClick={() => showToast('Password reset link sent to your email.', 'info')}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-forest text-white font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
            OR
          </span>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-forest hover:underline">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}
