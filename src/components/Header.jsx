import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, ShoppingBag, PlusCircle, 
  Award, TrendingUp, ChevronDown, LogOut, User, Package, Sprout, CreditCard, ShieldCheck,
  Bell, CheckCircle, AlertTriangle, ArrowRight, MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MobileDrawer from './MobileDrawer';

export default function Header() {
  const { user, cart, logoutUser, restockAlerts, dismissRestockAlert, markRestockAlertAsRead } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isFarmer = user?.role === 'farmer';

  // Alerts specifically directed to this farmer
  const farmerRestockAlerts = (restockAlerts || []).filter(a => 
    (a.farmer_id === user?.id || a.farmer_id === user?.farmer_id || a.farmer_name?.toLowerCase() === user?.full_name?.toLowerCase() || a.receiver_id === user?.id)
  );
  const unreadAlertsCount = farmerRestockAlerts.filter(a => !a.is_read).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logoutUser();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center space-x-3 shrink-0">
              <img src="/logo.png" alt="Farm Connect Eswatini" className="w-9 h-9 object-contain" />
              <div>
                <span className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight block leading-none">
                  Farm Connect
                </span>
                <span className="text-[10px] text-brand-forest font-semibold tracking-wider uppercase block mt-0.5">
                  ESWATINI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-5 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-brand-forest transition-colors">Home</Link>
              <Link to="/marketplace" className="hover:text-brand-forest transition-colors">Marketplace</Link>
              <Link to="/farmers" className="hover:text-brand-forest transition-colors">Farmers</Link>
              <Link to="/recommended-farmers" className="hover:text-brand-forest transition-colors flex items-center space-x-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
              </Link>
              {(isFarmer || user?.role === 'admin') && (
                <Link to="/market-trends" className="hover:text-brand-forest transition-colors flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Trends</span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-md">PRO</span>
                </Link>
              )}
              {user?.role !== 'buyer' && (
                <Link to="/subscriptions" className="hover:text-brand-forest transition-colors text-emerald-800 font-semibold">
                  Pricing
                </Link>
              )}
            </nav>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-xs relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search produce, farmers..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-brand-forest focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Farmer quick add listing (if farmer) */}
              {isFarmer && (
                <Link
                  to="/farmer/listings/new"
                  className="hidden sm:flex items-center space-x-1.5 bg-brand-forest text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-brand-dark transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Listing</span>
                </Link>
              )}

              {/* FARMER RESTOCK NOTIFICATION BELL WITH BADGE & POPUP */}
              {isFarmer && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsDropdownOpen(false);
                    }}
                    className="relative p-2 text-slate-700 hover:text-brand-forest rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Farmer Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadAlertsCount > 0 && (
                      <span className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                        {unreadAlertsCount}
                      </span>
                    )}
                  </button>

                  {/* Restock Alerts Popover */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl py-3 z-50 animate-slide-down">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-amber-500" />
                          <h4 className="font-bold text-slate-900 text-xs">Buyer Restock Requests</h4>
                        </div>
                        <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200/60">
                          {farmerRestockAlerts.length} total
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
                        {farmerRestockAlerts.length > 0 ? (
                          farmerRestockAlerts.map((alert) => (
                            <div key={alert.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-900">
                                    {alert.product_name}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Customer requested restock (Alert #{alert.attempt}/2)
                                  </p>
                                </div>
                                <span className="text-[9px] text-slate-400 whitespace-nowrap">
                                  {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <Link
                                  to="/farmer/dashboard"
                                  onClick={() => {
                                    markRestockAlertAsRead(alert.id);
                                    setIsNotifOpen(false);
                                  }}
                                  className="text-[11px] font-semibold text-brand-forest hover:underline flex items-center gap-0.5"
                                >
                                  <span>Update Stock</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>

                                <button
                                  onClick={() => dismissRestockAlert(alert.id)}
                                  className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No active restock alerts. All produce is in good standing!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cart Icon */}
              <Link 
                to="/cart" 
                className="relative p-2 text-slate-700 hover:text-brand-forest rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-forest text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Profile Menu Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <img
                      src={user.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-600 shrink-0"
                    />
                    <span className="hidden xl:inline-block text-xs font-semibold text-slate-800">
                      {user.full_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:inline-block" />
                  </button>

                  {/* Profile Dropdown Box */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 text-xs truncate">{user.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email || user.phone_number}</p>
                        <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1 text-xs text-slate-700">
                        {isFarmer ? (
                          <>
                            <Link 
                              to="/farmer/dashboard" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <User className="w-4 h-4 text-emerald-600" />
                              <span>Farmer Dashboard</span>
                            </Link>
                            <Link 
                              to="/farmer/listings" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <Package className="w-4 h-4 text-emerald-600" />
                              <span>Manage Listings</span>
                            </Link>
                            <Link 
                              to="/subscriptions" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <CreditCard className="w-4 h-4 text-amber-600" />
                              <span>My Subscription</span>
                            </Link>
                            <Link 
                              to="/farmer/plant-logs" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <Sprout className="w-4 h-4 text-emerald-600" />
                              <span>Plant Logs</span>
                            </Link>
                            <Link 
                              to="/messages" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                              <span>Messages & Inquiries</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link 
                              to="/buyer/dashboard" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <User className="w-4 h-4 text-emerald-600" />
                              <span>Buyer Dashboard</span>
                            </Link>
                            <Link 
                              to="/orders" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <Package className="w-4 h-4 text-emerald-600" />
                              <span>My Orders</span>
                            </Link>
                            <Link 
                              to="/messages" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                            >
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                              <span>Messages & Inquiries</span>
                            </Link>
                          </>
                        )}

                        <Link 
                          to="/admin" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest text-slate-800"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Admin Portal</span>
                        </Link>

                        <Link 
                          to="/account" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-forest"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Account Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <Link
                    to="/login"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-forest text-white hover:bg-brand-dark transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Trigger (Hamburger) */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-slate-700 hover:text-brand-forest rounded-lg hover:bg-slate-100 md:hidden"
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
