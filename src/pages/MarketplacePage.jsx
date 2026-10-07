import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, MapPin, ArrowUpDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function MarketplacePage() {
  const { listings } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync state if URL changes
  React.useEffect(() => {
    setSearchTerm(searchFromUrl);
    setSelectedCategory(categoryFromUrl);
  }, [searchFromUrl, categoryFromUrl]);

  // Filter & Sort Logic
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesProduct = item.product_type.toLowerCase().includes(query);
        const matchesFarmer = item.farmer_name.toLowerCase().includes(query);
        const matchesLoc = (item.location || '').toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        if (!matchesProduct && !matchesFarmer && !matchesLoc && !matchesDesc) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const catObj = PRODUCT_CATEGORIES.find(c => c.id === selectedCategory);
        const catName = catObj ? catObj.name.toLowerCase() : selectedCategory.toLowerCase();
        const itemCat = (item.category || '').toLowerCase();
        const itemProduct = (item.product_type || '').toLowerCase();
        if (!itemCat.includes(selectedCategory) && !itemCat.includes(catName) && !itemProduct.includes(selectedCategory)) {
          return false;
        }
      }

      // Location
      if (selectedLocation !== 'all') {
        const itemLoc = (item.location || '') + ' ' + (item.inkhundla || '');
        if (!itemLoc.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [listings, searchTerm, selectedCategory, selectedLocation, sortBy]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSearchParams(prev => {
      if (catId === 'all') prev.delete('category');
      else prev.set('category', catId);
      return prev;
    });
  };

  return (
    <div className="space-y-5 px-4 sm:px-6 lg:px-8 py-4 pb-16">
      
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketplace</h1>
          <p className="text-xs text-slate-500">Discover and buy fresh produce directly from local Eswatini farmers.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search spinach, maize, eggs, cattle..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-brand-forest focus:outline-none shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Scroll Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 pt-1">
        {PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                isSelected
                  ? 'bg-brand-forest text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Filter Strip & Sort Controls */}
      <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-forest" />
          <span>Filters</span>
          {(selectedCategory !== 'all' || selectedLocation !== 'all') && (
            <span className="w-2 h-2 bg-brand-forest rounded-full" />
          )}
        </button>

        {/* Location Selector (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Location:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Eswatini Regions</option>
            <option value="manzini">Manzini Region</option>
            <option value="mbabane">Mbabane / Hhohho</option>
            <option value="piggs peak">Piggs Peak</option>
            <option value="malkerns">Malkerns Valley</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-1 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <span className="text-slate-400 hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Count Header */}
      <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
        <span>Showing {filteredListings.length} produce listings</span>
        {(searchTerm || selectedCategory !== 'all' || selectedLocation !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLocation('all');
            }}
            className="text-brand-forest hover:underline font-semibold"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* PRODUCT LISTINGS GRID */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-brand-forest rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">No listings found</h3>
            <p className="text-xs text-slate-500 mt-1">
              We couldn't find any products matching your search criteria. Try removing filters or searching for another crop.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLocation('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-dark transition-colors inline-block"
          >
            Reset Search & Filters
          </button>
        </div>
      )}

      {/* MOBILE FILTER BOTTOM SHEET / DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-5 z-10 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Filter Marketplace</h3>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left border ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 text-brand-forest border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Location / Region</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="all">All Eswatini Regions</option>
                <option value="manzini">Manzini Region</option>
                <option value="mbabane">Mbabane / Hhohho</option>
                <option value="piggs peak">Piggs Peak</option>
                <option value="malkerns">Malkerns Valley</option>
              </select>
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-3 rounded-xl bg-brand-forest text-white font-bold text-sm hover:bg-brand-dark"
            >
              Apply Filters ({filteredListings.length} results)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
