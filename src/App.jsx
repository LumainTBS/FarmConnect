import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import ListingDetailPage from './pages/ListingDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

import BuyerDashboardPage from './pages/BuyerDashboardPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import FarmerListingsPage from './pages/FarmerListingsPage';
import AddListingPage from './pages/AddListingPage';
import PlantLogsPage from './pages/PlantLogsPage';

import FarmersDirectoryPage from './pages/FarmersDirectoryPage';
import FarmerProfilePage from './pages/FarmerProfilePage';
import RecommendedFarmersPage from './pages/RecommendedFarmersPage';
import MarketTrendsPage from './pages/MarketTrendsPage';
import MessagesPage from './pages/MessagesPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TermsPage from './pages/TermsPage';
import CookieConsent from './components/CookieConsent';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans selection:bg-brand-forest selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage isFarmerView={false} />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />

              {/* Buyer Routes */}
              <Route path="/buyer/dashboard" element={<BuyerDashboardPage />} />

              {/* Farmer Routes */}
              <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
              <Route path="/farmer/listings" element={<FarmerListingsPage />} />
              <Route path="/farmer/listings/new" element={<AddListingPage />} />
              <Route path="/farmer/orders" element={<OrdersPage isFarmerView={true} />} />
              <Route path="/farmer/plant-logs" element={<PlantLogsPage />} />

              {/* Discovery & Info */}
              <Route path="/farmers" element={<FarmersDirectoryPage />} />
              <Route path="/farmer/:id" element={<FarmerProfilePage />} />
              <Route path="/recommended-farmers" element={<RecommendedFarmersPage />} />
              <Route path="/market-trends" element={<MarketTrendsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Subscriptions & Admin */}
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <MobileNav />
          <Toast />
          <CookieConsent />
        </div>
      </Router>
    </AppProvider>
  );
}
