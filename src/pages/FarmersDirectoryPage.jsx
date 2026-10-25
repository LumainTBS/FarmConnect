import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, CheckCircle, Star, ArrowRight, ShieldCheck, 
  Sparkles, X, ChevronRight, Sprout, Wheat, Egg, Beef, Apple,
  Compass, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Produce categories for quick discovery
const PRODUCE_SPECIALTIES = [
  { id: 'all', label: 'All Produce', icon: Sprout },
  { id: 'vegetables', label: 'Vegetables & Greens', icon: Sprout, keywords: ['vegetable', 'tomato', 'cabbage', 'spinach', 'onion', 'pepper', 'potato', 'lettuce'] },
  { id: 'grains', label: 'Grains & Maize', icon: Wheat, keywords: ['grain', 'maize', 'corn', 'beans', 'sorghum', 'wheat', 'mealie'] },
  { id: 'fruits', label: 'Fruits & Berries', icon: Apple, keywords: ['fruit', 'orange', 'banana', 'mango', 'avocado', 'berry', 'citrus'] },
  { id: 'poultry', label: 'Poultry & Eggs', icon: Egg, keywords: ['poultry', 'egg', 'chicken', 'broiler', 'layer', 'bird'] },
  { id: 'livestock', label: 'Livestock', icon: Beef, keywords: ['livestock', 'cattle', 'goat', 'sheep', 'pig', 'meat', 'beef'] },
];

const ESWATINI_REGIONS = [
  { id: 'all', name: 'All Regions' },
  { id: 'manzini', name: 'Manzini Region' },
  { id: 'hhohho', name: 'Hhohho Region' },
  { id: 'lubombo', name: 'Lubombo Region' },
  { id: 'shiselweni', name: 'Shiselweni Region' },
];

export default function FarmersDirectoryPage() {
  const { farmers, listings, user } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [visibleResultsCount, setVisibleResultsCount] = useState(4);

  // User's registered area (if available)
  const userArea = user?.inkhundla || user?.street_address || user?.location || '';

  // Associate each farmer with their listed produce keywords
  const farmersWithProduce = useMemo(() => {
    return farmers.map((farmer) => {
      const farmerListings = listings.filter(
        (l) => l.farmer_id === farmer.id || 
               l.farmerId === farmer.id || 
               (l.farmer_name && l.farmer_name.toLowerCase() === farmer.name.toLowerCase())
      );

      const produceItems = farmerListings.map((l) => l.product_type.toLowerCase());
      const categories = farmerListings.map((l) => (l.category || '').toLowerCase());
      const tags = (farmer.tags || []).map((t) => t.toLowerCase());
      const about = (farmer.about || '').toLowerCase();

      return {
        ...farmer,
        listingsCount: farmerListings.length,
        searchCorpus: `${farmer.name} ${farmer.location} ${farmer.inkhundla || ''} ${produceItems.join(' ')} ${categories.join(' ')} ${tags.join(' ')} ${about}`.toLowerCase(),
      };
    });
  }, [farmers, listings]);

  // TOP 4 PERFORMING FARMERS (Row of 4 tops, prioritized by rating & goods sold)
  const topFourFarmers = useMemo(() => {
    return [...farmersWithProduce]
      .sort((a, b) => (b.rating || 5.0) - (a.rating || 5.0) || (b.goods_sold || 0) - (a.goods_sold || 0))
      .slice(0, 4);
  }, [farmersWithProduce]);

  // SUGGESTED FARMERS BASED ON USER REGISTERED AREA OR SELECTED REGION (Max 4)
  const suggestedByArea = useMemo(() => {
    const targetArea = selectedRegion !== 'all' 
      ? selectedRegion.toLowerCase() 
      : (userArea ? userArea.toLowerCase() : 'manzini');

    const matched = farmersWithProduce.filter((f) => {
      const loc = (f.location || '').toLowerCase();
      const inkhundla = (f.inkhundla || '').toLowerCase();
      return loc.includes(targetArea) || inkhundla.includes(targetArea);
    });

    // Fallback to top verified if no exact area match
    const resultList = matched.length > 0 ? matched : farmersWithProduce;
    return resultList.slice(0, 4);
  }, [farmersWithProduce, selectedRegion, userArea]);

  // FILTERED FARMERS (When user searches or clicks produce filters)
  const isFilterActive = searchQuery.trim() !== '' || selectedSpecialty !== 'all' || selectedRegion !== 'all';

  const filteredFarmers = useMemo(() => {
    if (!isFilterActive) return [];

    return farmersWithProduce.filter((farmer) => {
      // 1. Text search (Name, produce, crop, or inkhundla)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!farmer.searchCorpus.includes(q)) return false;
      }

      // 2. Specialty produce filter
      if (selectedSpecialty !== 'all') {
        const spec = PRODUCE_SPECIALTIES.find((s) => s.id === selectedSpecialty);
        if (spec && spec.keywords) {
          const hasKeyword = spec.keywords.some((k) => farmer.searchCorpus.includes(k));
          if (!hasKeyword) return false;
        }
      }

      // 3. Region filter
      if (selectedRegion !== 'all') {
        const reg = selectedRegion.toLowerCase();
        const loc = (farmer.location || '').toLowerCase();
        const inkh = (farmer.inkhundla || '').toLowerCase();
        if (!loc.includes(reg) && !inkh.includes(reg)) return false;
      }

      return true;
    });
  }, [farmersWithProduce, searchQuery, selectedSpecialty, selectedRegion, isFilterActive]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedRegion('all');
    setVisibleResultsCount(4);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 space-y-8">
      
      {/* 1. MINIMALIST LIQUID-GLASS HEADER & SEARCH HUB */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/95 to-slate-50/80 border border-slate-200/80 p-5 sm:p-8 shadow-xs backdrop-blur-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-900 text-[11px] font-semibold mb-2.5 backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Smart Producer Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Farmers Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Connect directly with verified local growers in your area without scrolling through endless clutter.
          </p>
        </div>

        {/* Minimalist Search Input */}
        <div className="mt-5 relative max-w-xl">
          <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleResultsCount(4);
              }}
              placeholder="Search farmer name, crop (e.g. cabbage, maize), or area..."
              className="w-full py-2.5 pl-2.5 pr-9 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Region Selector Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Region:</span>
          {ESWATINI_REGIONS.map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => {
                  setSelectedRegion(reg.id);
                  setVisibleResultsCount(4);
                }}
                className={`text-[11px] font-medium px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                {reg.name}
              </button>
            );
          })}

          {userArea && (
            <button
              onClick={() => {
                setSearchQuery(userArea);
                setVisibleResultsCount(4);
              }}
              className="text-[11px] font-semibold px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 transition-all cursor-pointer flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Near Me ({userArea})</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. PRODUCE SPECIALTY DISCOVERY CHIPS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-brand-forest" />
            <h2 className="text-sm font-bold text-slate-900">Check Farmers by Produce</h2>
          </div>
          {selectedSpecialty !== 'all' && (
            <button
              onClick={() => setSelectedSpecialty('all')}
              className="text-xs text-brand-forest hover:underline font-semibold"
            >
              Reset Produce
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {PRODUCE_SPECIALTIES.map((spec) => {
            const Icon = spec.icon;
            const isSelected = selectedSpecialty === spec.id;
            return (
              <button
                key={spec.id}
                onClick={() => {
                  setSelectedSpecialty(spec.id);
                  setVisibleResultsCount(4);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                    : 'bg-white/85 backdrop-blur-xs border-slate-200/70 hover:border-emerald-400 text-slate-700 hover:bg-white shadow-xs'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-brand-forest'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold truncate">{spec.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. ACTIVE SEARCH / FILTER RESULTS VIEW (If searching or filtering) */}
      {isFilterActive ? (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Matching Farmers</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {filteredFarmers.length} found
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filtered by {searchQuery ? `"${searchQuery}"` : ''} {selectedSpecialty !== 'all' ? `• Produce: ${selectedSpecialty}` : ''} {selectedRegion !== 'all' ? `• Region: ${selectedRegion}` : ''}
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-brand-forest hover:underline"
            >
              Clear filters
            </button>
          </div>

          {filteredFarmers.length > 0 ? (
            <div className="space-y-6">
              {/* 4 CARDS PER ROW ON DESKTOP, 2 PER ROW ON MOBILE */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredFarmers.slice(0, visibleResultsCount).map((farmer) => (
                  <FarmerCard key={farmer.id} farmer={farmer} />
                ))}
              </div>

              {/* Show 4 more to avoid dumping 100+ cards */}
              {filteredFarmers.length > visibleResultsCount && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setVisibleResultsCount((prev) => prev + 4)}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    Show 4 More Farmers ({filteredFarmers.length - visibleResultsCount} remaining)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-brand-forest rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No farmers found</h3>
              <p className="text-xs text-slate-500">
                Try searching for another produce type or clearing your regional filter.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-dark transition-colors inline-block"
              >
                Reset Search
              </button>
            </div>
          )}
        </section>
      ) : (
        /* DEFAULT CURATED MINIMALIST VIEW: TWO ROWS OF 4 TOPS */
        <>
          {/* ROW 1: TOP 4 CERTIFIED FARMERS (Row of 4 tops) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-bold text-slate-900">Top Verified Farmers</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    Top 4
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Leading certified producers with verified harvest track record and high ratings.
                </p>
              </div>
              <Link
                to="/recommended-farmers"
                className="text-xs font-semibold text-brand-forest hover:underline flex items-center gap-1"
              >
                <span>Full Leaderboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Exactly 4 tops per row on desktop, 2 per row on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {topFourFarmers.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} />
              ))}
            </div>
          </section>

          {/* ROW 2: SUGGESTED FARMERS IN YOUR AREA (Row of 4 tops) */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Suggested Farmers in Your Area
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {userArea || 'Manzini Region'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Producers closest to you for faster delivery and lower transit costs.
                </p>
              </div>
            </div>

            {/* Exactly 4 tops per row on desktop, 2 per row on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {suggestedByArea.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} />
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
}

// COMPACT, MINIMALIST LIQUID-GLASS FARMER CARD
function FarmerCard({ farmer }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
      {/* Cover Banner */}
      <div className="h-16 sm:h-20 w-full relative bg-slate-100 overflow-hidden">
        <img
          src={farmer.cover || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded-lg flex items-center space-x-1 shadow-xs border border-white/60">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{farmer.rating || 5.0}</span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3 pt-0 relative flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Avatar & Verification */}
          <div className="-mt-6 mb-2 flex items-end justify-between">
            <img
              src={farmer.avatar}
              alt={farmer.name}
              className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-xs shrink-0 bg-white"
              loading="lazy"
            />
            {farmer.is_verified && (
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70 flex items-center space-x-0.5">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-brand-forest transition-colors">
            {farmer.name}
          </h3>

          <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{farmer.location || farmer.inkhundla || 'Eswatini'}</span>
          </div>

          {/* Specialty tag chips (Max 2 for compact minimalism) */}
          <div className="flex flex-wrap gap-1 mt-2">
            {(farmer.tags || ['Produce', 'Direct Harvest']).slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md truncate max-w-[110px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100/80">
          <Link
            to={`/farmer/${farmer.id}`}
            className="w-full h-7 sm:h-8 rounded-lg sm:rounded-xl bg-brand-forest hover:bg-brand-dark text-white text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center space-x-1 shadow-xs"
          >
            <span>View Farm</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
