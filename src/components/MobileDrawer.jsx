import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Home, ShoppingBag, Package, MessageSquare, Users, Award, 
  TrendingUp, Sprout, Info, Settings, LogOut, UserCheck, CreditCard, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileDrawer({ isOpen, onClose }) {
  const { user, logoutUser } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
    logoutUser();
    navigate('/');
  };

  const isFarmer = user?.role === 'farmer';

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-xs bg-[#0D4A2B] text-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto">
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-emerald-800/60">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Farm Connect Logo" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
              <div>
                <span className="font-bold text-lg text-white block leading-tight">Farm Connect</span>
                <span className="text-[10px] text-emerald-300 font-medium tracking-widest uppercase">ESWATINI</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900/50"
              aria-label="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile Summary */}
          {user && (
            <div className="my-4 p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center space-x-3">
              <img 
                src={user.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                alt={user.full_name} 
                className="w-10 h-10 rounded-full object-cover border border-emerald-400 shrink-0" 
              />
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">{user.full_name}</div>
                <div className="text-[10px] text-emerald-200 capitalize flex items-center space-x-1 mt-0.5">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>Account: {user.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1 mt-2">
            <button 
              onClick={() => handleNavigate('/')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <Home className="w-5 h-5 text-emerald-400" />
              <span>Home</span>
            </button>

            <button 
              onClick={() => handleNavigate('/marketplace')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Marketplace</span>
            </button>

            <button 
              onClick={() => handleNavigate(isFarmer ? '/farmer/orders' : '/orders')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <Package className="w-5 h-5 text-emerald-400" />
              <span>{isFarmer ? 'Incoming Orders' : 'My Orders'}</span>
            </button>

            <button 
              onClick={() => handleNavigate('/messages')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Messages</span>
            </button>

            <button 
              onClick={() => handleNavigate('/farmers')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Farmers Directory</span>
            </button>

            <button 
              onClick={() => handleNavigate('/recommended-farmers')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <Award className="w-5 h-5 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button 
              onClick={() => handleNavigate('/market-trends')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Market Trends</span>
            </button>

            {isFarmer ? (
              <>
                <button 
                  onClick={() => handleNavigate('/farmer/dashboard')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
                >
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Farmer Dashboard</span>
                </button>
                <button 
                  onClick={() => handleNavigate('/farmer/plant-logs')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
                >
                  <Sprout className="w-5 h-5 text-emerald-400" />
                  <span>Plant Logs (Private)</span>
                </button>
                <button 
                  onClick={() => handleNavigate('/farmer/listings')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
                >
                  <Package className="w-5 h-5 text-emerald-400" />
                  <span>Manage Listings</span>
                </button>
                <button 
                  onClick={() => handleNavigate('/subscriptions')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
                >
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>My Subscription</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleNavigate('/buyer/dashboard')}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
              >
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Buyer Dashboard</span>
              </button>
            )}

            <button 
              onClick={() => handleNavigate('/admin')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Admin Portal</span>
            </button>

            <button 
              onClick={() => handleNavigate('/about')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <Info className="w-5 h-5 text-emerald-400" />
              <span>About Us</span>
            </button>

            <button 
              onClick={() => handleNavigate('/account')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/50 text-emerald-100 hover:text-white text-sm font-medium text-left"
            >
              <Settings className="w-5 h-5 text-emerald-400" />
              <span>Account Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-emerald-800/60">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-emerald-700 hover:bg-emerald-900 text-white font-medium text-sm flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleNavigate('/login')}
                className="w-full py-2.5 rounded-xl border border-emerald-600 text-white font-medium text-sm hover:bg-emerald-900"
              >
                Log In
              </button>
              <button
                onClick={() => handleNavigate('/register')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
