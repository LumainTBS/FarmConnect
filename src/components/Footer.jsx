import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-emerald-100 border-t border-emerald-800/60 mt-auto pb-20 md:pb-8 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Farm Connect" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
              <div>
                <span className="font-bold text-lg text-white block leading-none">Farm Connect</span>
                <span className="text-[10px] text-emerald-300 font-semibold tracking-widest uppercase">ESWATINI</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Connecting farmers and buyers across Eswatini with fresh local produce, transparent pricing, and direct agricultural trade.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><Link to="/marketplace?category=vegetables" className="hover:text-white transition-colors">Vegetables</Link></li>
              <li><Link to="/marketplace?category=fruits" className="hover:text-white transition-colors">Fruits</Link></li>
              <li><Link to="/marketplace?category=grains" className="hover:text-white transition-colors">Grains & Cereals</Link></li>
              <li><Link to="/marketplace?category=livestock" className="hover:text-white transition-colors">Livestock & Poultry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Farmers & Community</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><Link to="/farmers" className="hover:text-white transition-colors">Farmers Directory</Link></li>
              <li><Link to="/recommended-farmers" className="hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link to="/market-trends" className="hover:text-white transition-colors">Market Trends</Link></li>
              <li><Link to="/farmer/plant-logs" className="hover:text-white transition-colors">Plant Logs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Company & Legal</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Privacy Policy</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('openCookiePreferences'))}
                  className="hover:text-white transition-colors text-left text-emerald-300 underline cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
              <li><Link to="/account" className="hover:text-white transition-colors">Account Settings</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Join as Farmer</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/80 gap-2">
          <span>&copy; {new Date().getFullYear()} Farm Connect Eswatini. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <Link to="/terms" className="hover:underline text-emerald-300/90">Terms of Service</Link>
            <span>&middot;</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openCookiePreferences'))}
              className="hover:underline text-emerald-300/90 cursor-pointer"
            >
              Manage Cookies
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
