import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft, Eye, Sparkles, Lock, AlertTriangle, ShieldCheck, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES, SUBSCRIPTION_TIERS, isFarmerListing, compressImage, uploadListingImageToStorage } from '../lib/supabase';

export default function AddListingPage() {
  const { addListing, listings, user, showToast } = useApp();
  const navigate = useNavigate();

  const [productType, setProductType] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  // Quota & Tier Checks
  const farmerListings = listings.filter(l => isFarmerListing(l, user));
  const userTierKey = user?.subscription_tier || 'free';
  const currentTier = SUBSCRIPTION_TIERS[userTierKey] || SUBSCRIPTION_TIERS.free;
  const isLimitReached = farmerListings.length >= currentTier.maxListings;

  // Image previews (up to 3) & tracking of raw uploaded files for storage upload
  const [imageUrls, setImageUrls] = useState([
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
  ]);
  const [imageFiles, setImageFiles] = useState({});

  // Step state: 'form' | 'preview'
  const [step, setStep] = useState('form');

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 3) {
      showToast('Maximum 3 photos allowed per listing', 'info');
    }

    const availableSlots = 3 - imageUrls.length;
    const filesToProcess = files.slice(0, availableSlots);

    for (const file of filesToProcess) {
      try {
        const compressedPreview = await compressImage(file, 800, 0.75);
        if (compressedPreview) {
          setImageUrls(prev => {
            const nextIdx = prev.length;
            setImageFiles(currFiles => ({ ...currFiles, [nextIdx]: file }));
            return [...prev, compressedPreview];
          });
        }
      } catch (err) {
        console.warn('Error reading file preview:', err);
      }
    }
  };

  const handleAddSampleImage = (url) => {
    if (imageUrls.length >= 3) return;
    setImageUrls(prev => [...prev, url]);
  };

  const handleRemoveImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => {
      const next = {};
      let nextI = 0;
      imageUrls.forEach((_, i) => {
        if (i !== index) {
          if (prev[i]) next[nextI] = prev[i];
          nextI++;
        }
      });
      return next;
    });
  };

  // Verification & Location checks
  const isVerified = user?.is_verified === true || user?.verification_status === 'approved';
  const hasUploadedDoc = Boolean(user?.id_document_url);
  const isPendingReview = hasUploadedDoc && !isVerified;
  const isLocationMissing = !user?.location && !user?.inkhundla && !user?.street_address;
  const isVerificationRejected = user?.verification_status === 'rejected';

  const handleProceedToPreview = (e) => {
    e.preventDefault();
    if (!productType || !price || !quantity) return;
    if (!isVerified) {
      showToast(
        isPendingReview
          ? 'Verification Under Review: Admin approval is required before listing produce.'
          : 'Producer Verification Required: Please submit your National ID and proof of residency first.',
        'error'
      );
      return;
    }
    if (isLocationMissing) {
      showToast('Please enter your farm location before publishing produce.', 'error');
      return;
    }
    if (isLimitReached) {
      showToast(`Listing limit reached (${farmerListings.length}/${currentTier.maxListings}). Please upgrade your plan.`, 'error');
      return;
    }
    setStep('preview');
  };

  const handlePublish = async () => {
    if (!productType || !productType.trim()) {
      showToast('Please enter a product name.', 'error');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Please enter a valid price greater than 0.', 'error');
      return;
    }
    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      showToast('Please enter a valid quantity greater than 0.', 'error');
      return;
    }
    if (!isVerified) {
      showToast('Producer verification required to publish listings.', 'error');
      return;
    }
    if (isLocationMissing) {
      showToast('Location required before listing produce.', 'error');
      return;
    }
    if (isLimitReached) {
      showToast(`Listing limit reached for ${currentTier.name}. Please upgrade to list more items.`, 'error');
      return;
    }

    setIsPublishing(true);
    setPublishError('');

    try {
      // 1. Upload any raw files to Supabase Storage with graceful fallback
      const finalImageUrls = await Promise.all(
        imageUrls.map(async (url, idx) => {
          const file = imageFiles[idx];
          if (file) {
            const storageUrl = await uploadListingImageToStorage(file, user?.id);
            if (storageUrl) return storageUrl;
            // Fallback: use compressed image data URL
            const compressed = await compressImage(file, 800, 0.7);
            return compressed || url;
          }
          return url;
        })
      );

      const listingData = {
        product_type: productType.trim(),
        category,
        description: description.trim(),
        quantity: parsedQty,
        unit,
        price: parsedPrice,
        harvest_date: harvestDate,
        images: finalImageUrls.length > 0 ? finalImageUrls : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'],
        inkhundla: user?.inkhundla || 'Ludzeludze',
        location: user?.location || (user?.inkhundla ? `${user.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini')
      };

      const result = await addListing(listingData);

      if (result && result.success) {
        navigate('/farmer/listings');
      } else {
        const errorMsg = result?.error || 'Database submission failed. Please check your connection and try again.';
        setPublishError(errorMsg);
      }
    } catch (err) {
      console.error('Publication exception:', err);
      const errText = err.message || 'An unexpected error occurred while publishing.';
      setPublishError(errText);
    } finally {
      setIsPublishing(false);
    }
  };

  const sampleImages = [
    { label: 'Leafy Green / Spinach', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
    { label: 'Free Range Eggs', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80' },
    { label: 'Yellow Sweet Corn', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80' },
    { label: 'Grass-fed Cattle Beef', url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Carrots', url: 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=800&q=80' }
  ];

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Sign in to add a product</h2>
        <p className="text-xs text-slate-500">Only registered farmers can publish produce to the marketplace.</p>
        <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-brand-forest text-white font-bold rounded-xl text-xs">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      {/* PRODUCER ID & RESIDENCY VERIFICATION GATE BANNER */}
      {!isVerified && (
        <div className={`p-5 rounded-3xl border shadow-sm ${
          isPendingReview
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : isVerificationRejected
            ? 'bg-rose-50/80 border-rose-300 text-rose-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                isPendingReview 
                  ? 'bg-amber-100 text-amber-800' 
                  : isVerificationRejected
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isPendingReview ? (
                  <Clock className="w-5 h-5 animate-pulse" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider">
                    {isPendingReview 
                      ? 'Verification Under Review' 
                      : isVerificationRejected 
                      ? 'Verification Resubmission Required' 
                      : 'Producer Verification Required'}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPendingReview 
                      ? 'bg-amber-200 text-amber-900' 
                      : isVerificationRejected 
                      ? 'bg-rose-200 text-rose-900' 
                      : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {isPendingReview ? 'Under Review' : isVerificationRejected ? 'Action Needed' : 'Mandatory'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {isPendingReview ? (
                    <>Your National ID and Proof of Residency have been uploaded and are currently under review by FarmConnect administrators. You will be able to publish listings as soon as your account is approved.</>
                  ) : isVerificationRejected ? (
                    <>Your previous identification documents could not be verified. Please submit an updated National ID and proof of farm residency.</>
                  ) : (
                    <>In accordance with Eswatini agricultural standards and buyer safety policies, all local producers must submit their <strong>National ID</strong> and <strong>Proof of Farm Residency</strong> before listing produce.</>
                  )}
                </p>
              </div>
            </div>
            
            <Link
              to="/account"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap text-center shrink-0"
            >
              {isPendingReview ? 'View Documents' : 'Submit ID Documents →'}
            </Link>
          </div>
        </div>
      )}

      {/* LISTING QUOTA LIMIT REACHED BANNER */}
      {isLimitReached && (
        <div className="p-5 bg-rose-50 border border-rose-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-rose-950">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-900">
                Listing Limit Reached ({farmerListings.length} / {currentTier.maxListings})
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                You have reached the maximum allowed produce listings for your <strong>{currentTier.name}</strong>. Upgrade your plan to unlock more listing slots and lower commission rates.
              </p>
            </div>
          </div>
          <Link
            to="/subscriptions"
            className="px-4 py-2.5 bg-brand-forest hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap text-center"
          >
            Upgrade Plan →
          </Link>
        </div>
      )}

      {/* Missing Location Warning Banner */}
      {isLocationMissing && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-3 text-amber-900">
          <div className="space-y-1 flex-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">Location Required</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              You must provide your Inkhundla or farm location before you can publish produce listings for buyers.
            </p>
            <button
              onClick={() => navigate('/account')}
              className="mt-2 text-xs font-bold text-amber-900 underline block"
            >
              Update Farm Location in Account Settings →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {step === 'form' ? 'Add Product Listing' : 'Listing Preview'}
        </h1>
      </div>

      {step === 'form' ? (
        /* STEP 1: CREATION FORM */
        <form onSubmit={handleProceedToPreview} className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name / Crop Type
            </label>
            <input
              type="text"
              required
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              placeholder="e.g. Fresh Spinach, Yellow Maize, Free Range Eggs..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
              >
                {PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harvest Date
              </label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (E)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="20"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
              >
                <option value="kg">kg</option>
                <option value="bags">bags</option>
                <option value="dozen">dozen</option>
                <option value="head">head (livestock)</option>
                <option value="crates">crates</option>
                <option value="litres">litres</option>
                <option value="item">item / unit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your produce, harvest quality, soil conditions, and pickup arrangements..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
            />
          </div>

          {/* UP TO 3 PRODUCT IMAGES */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Product Images ({imageUrls.length}/3)
              </label>
              <span className="text-[11px] text-slate-500">Up to 3 high-quality photos</span>
            </div>

            {/* Upload File Input Button */}
            {imageUrls.length < 3 && (
              <label className="flex items-center justify-center space-x-2 p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-brand-forest" />
                <span className="text-xs font-bold text-brand-forest">Upload Produce Image from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Selected Image Previews */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-slate-900/80 text-white p-0.5 rounded-full hover:bg-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sample produce photos selector for quick demo */}
            {imageUrls.length < 3 && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block">Or select sample agricultural photo:</span>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((s, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleAddSampleImage(s.url)}
                      className="text-[10px] font-medium p-1.5 rounded bg-white border border-slate-200 hover:border-emerald-500 truncate text-slate-700"
                    >
                      + {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer ${
              !isVerified 
                ? 'bg-slate-300 text-slate-600 hover:bg-slate-400' 
                : 'bg-brand-forest text-white hover:bg-brand-dark'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{!isVerified ? 'Verification Required to Proceed' : 'Preview Listing'}</span>
          </button>
        </form>
      ) : (
        /* STEP 2: PREVIEW BEFORE PUBLISHING */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-md">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 font-medium">
            Review your product details carefully before publishing to the marketplace.
          </div>

          <div className="space-y-4">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={imageUrls[0]} alt={productType} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase px-2 py-0.5 rounded bg-emerald-50">
                {category}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{productType}</h2>
              <div className="text-xl font-extrabold text-brand-forest">
                E{price} <span className="text-xs font-normal text-slate-500">per {unit}</span>
              </div>
              <div className="text-xs text-slate-500">
                Available: {quantity} {unit} • Harvest Date: {harvestDate}
              </div>
            </div>

            <p className="text-xs text-slate-600 border-t border-slate-100 pt-3">
              {description}
            </p>
          </div>

          {publishError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{publishError}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setStep('form')}
              disabled={isPublishing}
              className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Edit Details
            </button>
            <button
              onClick={handlePublish}
              disabled={!isVerified || isPublishing}
              className={`flex-1 py-3 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-2 ${
                !isVerified || isPublishing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-forest text-white hover:bg-brand-dark cursor-pointer'
              }`}
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing Listing to Supabase...</span>
                </>
              ) : (
                <span>{!isVerified ? 'Verification Required' : 'Publish Listing'}</span>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
