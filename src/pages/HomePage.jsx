import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Carrot, Apple, Wheat, Beef, Milk, Package, 
  MapPin, CheckCircle, ArrowRight, ShieldCheck, HeartHandshake, Sprout, ChevronRight,
  ChevronLeft, Tag, Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { user, listings, farmers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // 4-Image Automatic Smooth Carousel using H1 - H4
  const heroSlides = [
    {
      image: '/images/H1.png',
      tag: 'Fresh Farmgate Harvest',
      title: 'Malkerns & Ezulwini Valleys',
      desc: 'Prime high-yield seasonal vegetables harvested daily by certified local growers.',
      badge: 'Verified Origins'
    },
    {
      image: '/images/H2.png',
      tag: 'Smallholder Excellence',
      title: 'Hhohho & Lubombo Farms',
      desc: 'Connect directly with family-run farms and agricultural co-ops without middlemen.',
      badge: 'Direct Producer Trade'
    },
    {
      image: '/images/H3.png',
      tag: 'Bulk Procurement',
      title: 'Kingdom-Wide Aggregation',
      desc: 'Reliable volume harvests for restaurants, schools, supermarkets, and hotels.',
      badge: 'Commercial Wholesale'
    },
    {
      image: '/images/H4.png',
      tag: '100% Upfront Pricing',
      title: 'Sustainable Local Exchange',
      desc: 'Zero hidden fees with verified quality grading and transparent payment terms.',
      badge: 'Fair Trade Guarantee'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, heroSlides.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/marketplace?search=' + encodeURIComponent(searchQuery.trim()));
    }
  };

  const categories = [
    { id: 'vegetables', name: 'Vegetables', icon: Carrot, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'fruits', name: 'Fruits', icon: Apple, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'grains', name: 'Grains & Cereals', icon: Wheat, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { id: 'livestock', name: 'Livestock', icon: Beef, color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'dairy', name: 'Dairy', icon: Milk, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'processed', name: 'Processed', icon: Package, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* HERO SECTION WITH 4-IMAGE AUTOMATIC CAROUSEL (H1.png - H4.png) */}
      <section className="px-4 sm:px-6 lg:px-8 mt-4">
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-[#061A0F] text-white min-h-[470px] sm:min-h-[490px] flex flex-col justify-between"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Carousel Slides */}
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-out ${
                  currentSlide === idx 
                    ? 'opacity-100 scale-100 z-10' 
                    : 'opacity-0 scale-105 z-0 pointer-events-none'
                }`}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061A0F] via-[#0D4A2B]/75 to-[#061A0F]/60" />
              </div>
            ))}
          </div>

          {/* Top Controls & Navigation Dots */}
          <div className="relative z-10 p-5 sm:p-7 flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-emerald-100 text-xs font-semibold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span>Kingdom of Eswatini &middot; Agricultural Exchange</span>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Hero Content Area */}
          <div className="relative z-10 px-6 sm:px-8 pb-8 pt-2 max-w-2xl space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
              Local Farms.<br />Real Products.<br />Stronger Communities.
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-xl">
              Connect directly with verified local farmers and commercial buyers. 100% upfront pricing, landmark pickups, and reliable harvests across Eswatini.
            </p>

            {/* Search Bar / Action Buttons */}
            <div className="pt-1">
              <form onSubmit={handleSearch} className="max-w-lg">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fresh cabbage, tomatoes, maize, or farmers..."
                    className="w-full pl-10 pr-24 py-3.5 bg-white/95 text-slate-900 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                  <button 
                    type="submit"
                    className="absolute right-1.5 bg-brand-forest hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Liquid Glass Slide Badge Overlay */}
            <div className="pt-2">
              <div className="liquid-glass-dark p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-4 border border-emerald-400/30">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    {heroSlides[currentSlide].tag}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {heroSlides[currentSlide].title}
                  </div>
                  <div className="text-xs text-emerald-100/80">
                    {heroSlides[currentSlide].desc}
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-[11px] font-bold rounded-lg uppercase tracking-wide">
                  {heroSlides[currentSlide].badge}
                </span>
              </div>
            </div>
          </div>

          {/* Slide Arrow Navigation */}
          <button 
            onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-emerald-600/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-emerald-600/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* TWO PROMOTIONAL & REWARD BANNERS (SPLIT LAYOUT: TYPOGRAPHY LEFT, IMAGE RIGHT) */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Banner 1: Customer Promotion & Reward Program (B1.png with typography left, image right) */}
          <div className="banner-split p-6 sm:p-7 text-white flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-emerald-400/50 transition-all">
            <div className="space-y-3 z-10 flex-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200">
                <Tag className="w-3.5 h-3.5 text-emerald-300" />
                <span>Customer Reward Program</span>
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-white leading-tight">
                Bulk Harvest Rebate & Loyalty Credits
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-md">
                Earn 10% cash-back reward credits on all commercial produce orders above SZL 1,000 from verified Eswatini farmers.
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <Link 
                  to="/marketplace" 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  <span>Claim Promotion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/subscriptions"
                  className="text-xs font-semibold text-emerald-200 hover:text-white underline underline-offset-4"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="relative shrink-0 w-full sm:w-44 h-36 sm:h-36 rounded-2xl overflow-hidden border border-emerald-400/30 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/images/B1.png" 
                alt="Promotion Reward" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>

          {/* Banner 2: Call To Action / Direct Aggregation & Logistics (B2.png with typography left, image right) */}
          <div className="banner-split p-6 sm:p-7 text-white flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-emerald-400/50 transition-all">
            <div className="space-y-3 z-10 flex-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-200">
                <Truck className="w-3.5 h-3.5 text-amber-300" />
                <span>Kingdom-Wide Logistics</span>
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-white leading-tight">
                Scheduled Cold-Chain & Landmark Pickups
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-md">
                Guaranteed same-day aggregation across Mbabane, Manzini, and Matsapha hubs with verified temperature-controlled safety.
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <Link 
                  to="/farmers" 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  <span>Explore Local Hubs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/about"
                  className="text-xs font-semibold text-amber-200 hover:text-white underline underline-offset-4"
                >
                  View Route Info
                </Link>
              </div>
            </div>

            <div className="relative shrink-0 w-full sm:w-44 h-36 sm:h-36 rounded-2xl overflow-hidden border border-emerald-400/30 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/images/B2.png" 
                alt="Logistics Network" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>

        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Browse by Category</h2>
          <Link to="/marketplace" className="text-xs font-semibold text-brand-forest hover:underline flex items-center gap-1">
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/marketplace?category=${encodeURIComponent(cat.id)}`}
                className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex flex-col items-center justify-center text-center hover:border-emerald-500 hover:shadow-sm transition-all group liquid-glass-card"
              >
                <div className={`p-3 rounded-xl ${cat.color} mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-800 tracking-tight leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured Listings</h2>
            <p className="text-xs text-slate-500">Fresh produce from local farmers and trusted sellers.</p>
          </div>
          <Link to="/marketplace" className="text-xs font-semibold text-brand-forest hover:underline flex items-center gap-1">
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.slice(0, 4).map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* SUGGESTED FARMERS (PROXIMITY) */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs liquid-glass">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-brand-forest" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Suggested Farmers Nearby</h2>
                <p className="text-xs text-slate-500">Ranked by geographic proximity in Eswatini regions.</p>
              </div>
            </div>
            <Link to="/farmers" className="text-xs font-semibold text-brand-forest hover:underline">
              All Farmers
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {farmers.map((farmer) => (
              <Link 
                key={farmer.id}
                to={`/farmer/${farmer.id}`}
                className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all liquid-glass-card"
              >
                <img 
                  src={farmer.avatar} 
                  alt={farmer.name} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{farmer.name}</h3>
                    {farmer.is_verified && <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{farmer.location}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-emerald-800 font-medium mt-1">
                    <span>★ {farmer.rating}</span>
                    <span>&middot;</span>
                    <span>{farmer.goods_sold} items sold</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT FARM CONNECT ESWATINI BANNER (BELOW SUGGESTED FARMERS SECTION) */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div 
          className="relative rounded-3xl overflow-hidden text-white p-8 sm:p-12 text-center space-y-4 shadow-xl border border-emerald-700/40"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(7, 35, 20, 0.94) 0%, rgba(13, 74, 43, 0.86) 55%, rgba(6, 40, 24, 0.90) 100%), url('/images/farmconnect-hero.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-3.5">
            <div className="w-16 h-16 mx-auto bg-white rounded-full p-2.5 shadow-xl flex items-center justify-center">
              <img src="/logo.png" alt="Farm Connect Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              About Farm Connect Eswatini
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl mx-auto font-normal">
              Building a stronger agricultural community through technology, transparent trade, and direct farmer-buyer connections.
            </p>
            <div className="pt-2 flex justify-center items-center space-x-3">
              <Link 
                to="/about"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Discover Our Mission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link 
                to="/farmers"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 backdrop-blur-md"
              >
                <span>Meet Our Farmers</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITIONS WITH CRISP GLASSMORPHISM */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="liquid-glass-card p-5 space-y-3 border border-emerald-200/80 hover:border-emerald-400 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Trusted Transactions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verified local farmers and direct communication for transparent and fair agricultural pricing across all four regions.
            </p>
          </div>

          <div className="liquid-glass-card p-5 space-y-3 border border-emerald-200/80 hover:border-emerald-400 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Support Local Farmers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empowering Eswatini agricultural smallholders by connecting them directly with retail buyers, institutions, and supermarkets.
            </p>
          </div>

          <div className="liquid-glass-card p-5 space-y-3 border border-emerald-200/80 hover:border-emerald-400 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Sustainable Community</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time crop logging, market price trends, and seasonal agronomy tips to strengthen national food security.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
