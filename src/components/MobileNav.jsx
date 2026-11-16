import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Package, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { user, cart, unreadMessagesCount } = useApp();

  const isFarmer = user?.role === 'farmer';
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { 
      label: 'Marketplace', 
      path: '/marketplace', 
      icon: ShoppingBag, 
      badge: cartCount > 0 ? cartCount : null 
    },
    { 
      label: 'Orders', 
      path: isFarmer ? '/farmer/orders' : '/orders', 
      icon: Package 
    },
    { 
      label: 'Messages', 
      path: '/messages', 
      icon: MessageSquare, 
      badge: unreadMessagesCount > 0 ? (unreadMessagesCount > 9 ? '9+' : unreadMessagesCount) : null,
      badgeDot: unreadMessagesCount > 0 
    },
    { 
      label: isFarmer ? 'Dashboard' : 'Account', 
      path: isFarmer ? '/farmer/dashboard' : '/account', 
      icon: User 
    },
  ];

  return (
    <div className="fixed bottom-3.5 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-40 md:hidden pointer-events-none">
      <nav 
        className="pointer-events-auto bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_12px_30px_-4px_rgba(13,74,43,0.18),0_4px_12px_rgba(0,0,0,0.06)] rounded-2xl px-2 py-1.5 transition-all duration-300"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95
                  ${isActive 
                    ? 'text-brand-forest font-bold bg-emerald-50/80 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-brand-forest stroke-[2.4] scale-110' : 'text-slate-500'}`} />
                      {item.badge && (
                        <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                          {item.badge}
                        </span>
                      )}
                      {item.badgeDot && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                      )}
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight leading-none font-medium">
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-brand-forest rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
