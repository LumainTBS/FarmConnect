import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, CheckCircle, Package, AlertCircle, Trash2, Database, UploadCloud, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFarmerListing } from '../lib/supabase';

export default function FarmerListingsPage() {
  const { listings, user, updateListingStatus, updateListingDetails, deleteListing, deployAllListingsToSupabase, showToast } = useApp();
  const [editingListing, setEditingListing] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const farmerListings = listings.filter(l => isFarmerListing(l, user));

  const handleDeployToSupabase = async () => {
    setIsDeploying(true);
    const result = await deployAllListingsToSupabase();
    setIsDeploying(false);
    if (!result.success && result.error) {
      showToast(`Supabase Deploy Note: ${result.error}`, 'info');
    }
  };

  const handleStartEdit = (listing) => {
    setEditingListing(listing);
    setEditProductName(listing.product_type || listing.title || '');
    setEditPrice(listing.price !== undefined ? listing.price : '');
    setEditQuantity(listing.quantity !== undefined ? listing.quantity : '');
    setEditDescription(listing.description || '');
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    const trimmedName = editProductName.trim();
    if (!trimmedName) {
      setEditError('Product name cannot be empty. Please enter a valid name (e.g. Green Pepper, Sweet Corn).');
      return;
    }

    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setEditError('Please enter a valid price greater than 0.');
      return;
    }

    const parsedQuantity = parseFloat(editQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      setEditError('Please enter a valid quantity.');
      return;
    }

    if (!editingListing) return;

    setIsSavingEdit(true);
    try {
      const result = await updateListingDetails(editingListing.id, {
        product_type: trimmedName,
        title: trimmedName,
        price: parsedPrice,
        quantity: parsedQuantity,
        description: editDescription.trim()
      });

      if (result && result.success === false) {
        setEditError(result.error || 'Failed to update listing.');
      } else {
        setEditingListing(null);
      }
    } catch (err) {
      setEditError(err.message || 'Error saving listing changes.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Product Listings</h1>
          <p className="text-xs text-slate-500">Update availability, prices, and quantities for your produce.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDeployToSupabase}
            disabled={isDeploying}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            title="Upload and sync produce listings directly to Supabase cloud database"
          >
            {isDeploying ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
            ) : (
              <UploadCloud className="w-4 h-4 text-emerald-700" />
            )}
            <span>{isDeploying ? 'Deploying...' : 'Deploy to Supabase'}</span>
          </button>

          <Link
            to="/farmer/listings/new"
            className="px-4 py-2 bg-brand-forest text-white font-bold text-xs rounded-xl hover:bg-brand-dark transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Listing</span>
          </Link>
        </div>
      </div>

      {farmerListings.length > 0 ? (
        <div className="space-y-3">
          {farmerListings.map((listing) => (
            <div 
              key={listing.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center space-x-3.5">
                <img 
                  src={listing.images ? listing.images[0] : 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80'} 
                  alt={listing.product_type} 
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" 
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{listing.product_type}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Price: <strong className="text-brand-forest">E{listing.price}/{listing.unit}</strong> • Quantity: {listing.quantity} {listing.unit}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Harvest Date: {listing.harvest_date || 'Recent'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                
                {/* Status Toggle Selector */}
                <select
                  value={listing.status}
                  onChange={(e) => updateListingStatus(listing.id, e.target.value)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                    listing.status === 'available'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : listing.status === 'reserved'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>

                <button
                  onClick={() => handleStartEdit(listing)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-200 flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete "${listing.product_type}"?`)) {
                      deleteListing(listing.id);
                    }
                  }}
                  className="px-2.5 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  title="Delete listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8 space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">You haven't listed any products yet.</h3>
            <p className="text-xs text-slate-500 mt-1">Start selling by publishing your first crop or agricultural listing.</p>
          </div>
          <Link
            to="/farmer/listings/new"
            className="inline-block px-6 py-3 rounded-xl bg-brand-forest text-white font-bold text-xs hover:bg-brand-dark transition-colors shadow-xs"
          >
            Add your first listing
          </Link>
        </div>
      )}

      {/* EDIT LISTING MODAL (ALLOWS EDITING PRODUCT NAME, PRICE, QUANTITY, DESCRIPTION) */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => !isSavingEdit && setEditingListing(null)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 z-10 shadow-2xl border border-slate-200 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center space-x-3">
                <img
                  src={editingListing.images ? editingListing.images[0] : 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80'}
                  alt={editingListing.product_type}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Edit Product Listing</h3>
                  <p className="text-[11px] text-slate-500">ID: {editingListing.id?.slice(0, 8)}... &middot; Category: {editingListing.category || 'produce'}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={() => setEditingListing(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Error Notification Banner */}
            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Product Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  placeholder="e.g. Green Pepper, Sweet Yellow Corn, Fresh Spinach"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Correct mistakes (e.g. Yellow Pepper to Green Pepper) without deleting the listing.
                </p>
              </div>

              {/* Price & Quantity Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Price per {editingListing.unit || 'unit'} (E) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Available Quantity ({editingListing.unit || 'unit'}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Product Description (Optional)
                </label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe harvest freshness, packaging grade, or collection landmark..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center space-x-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setEditingListing(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-dark disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
