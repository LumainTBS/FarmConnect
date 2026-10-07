import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Package, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { user, cart, messages } = useApp();

  const isFarmer = user?.role === 'farmer';
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasUnreadMessages = messages.some(m => m.unread);

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
      badgeDot: hasUnreadMessages 
    },
    { 
      label: isFarmer ? 'Dashboard' : 'Account', 
      path: isFarmer ? '/farmer/dashboard' : '/account', 
      icon: User 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 py-1.5 px-3 md:hidden shadow-lg pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center w-14 py-1 rounded-lg transition-colors
                ${isActive ? 'text-brand-forest font-semibold' : 'text-slate-500 hover:text-slate-800'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-forest stroke-[2.5]' : 'text-slate-500'}`} />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    {item.badgeDot && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight leading-tight">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
