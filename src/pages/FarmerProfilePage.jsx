import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, CheckCircle, Star, MessageSquare, ShieldCheck,
  Truck, Award, ArrowLeft, Edit3, X, Camera, Upload, AlertCircle, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isAuthorizedAdminEmail, compressImage, uploadProfileImageToStorage } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function FarmerProfilePage() {
  const { id } = useParams();
  const {
    farmers,
    listings,
    user,
    sendMessage,
    updateUserProfile,
    reviews,
    fetchFarmerReviews,
    addFarmerReview,
    showToast
  } = useApp();
  const navigate = useNavigate();

  // 1. Check if the visited profile is the currently authenticated user or farmer
  const isCurrentUser = Boolean(user && (id === user.id || id === user.farmer_id));
  const canEditProfile = Boolean(isCurrentUser || isAuthorizedAdminEmail(user?.email));

  // 2. Find from farmers list or construct from listings
  const foundFarmer = (farmers || []).find(f => f.id === id);
  const sampleListing = (listings || []).find(l => l.farmer_id === id);

  const farmer = isCurrentUser ? {
    id: user.id,
    name: user.full_name || 'My Farm',
    avatar: user.profile_picture_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    cover: user.cover_image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: user.location || (user.inkhundla ? `${user.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini'),
    inkhundla: user.inkhundla || 'Ludzeludze',
    is_verified: user.is_verified || false,
    about: user.about || user.bio || 'Local verified agricultural producer on Farm Connect Eswatini.',
    tags: ['Verified Farmer', 'Direct Farm Gate'],
    rating: null,
    reviews_count: 0,
    goods_sold: user.goods_sold || 0,
    response_rate: 100,
    phone: user.phone_number || '',
    email: user.email || ''
  } : (foundFarmer ? {
    id: foundFarmer.id,
    name: foundFarmer.name || foundFarmer.full_name || 'Local Farmer',
    avatar: foundFarmer.avatar || foundFarmer.profile_picture_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    cover: foundFarmer.cover || foundFarmer.cover_image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: foundFarmer.location || (foundFarmer.inkhundla ? `${foundFarmer.inkhundla}, Manzini Region` : 'Manzini Region, Eswatini'),
    inkhundla: foundFarmer.inkhundla || 'Ludzeludze',
    is_verified: foundFarmer.is_verified || false,
    about: foundFarmer.about || foundFarmer.bio || 'Local producer on Farm Connect Eswatini.',
    tags: ['Local Producer'],
    rating: null,
    reviews_count: 0,
    goods_sold: foundFarmer.goods_sold || 0,
    response_rate: 100,
    phone: foundFarmer.phone || foundFarmer.phone_number || '',
    email: foundFarmer.email || ''
  } : (sampleListing ? {
    id: sampleListing.farmer_id,
    name: sampleListing.farmer_name || 'Local Farmer',
    avatar: sampleListing.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: sampleListing.location || 'Manzini Region, Eswatini',
    inkhundla: sampleListing.inkhundla || 'Ludzeludze',
    is_verified: sampleListing.is_verified || false,
    about: 'Local producer on Farm Connect Eswatini.',
    tags: ['Local Producer'],
    rating: null,
    reviews_count: 0,
    goods_sold: 0,
    response_rate: 100,
    phone: '',
    email: sampleListing.farmer_email || ''
  } : null));

  // Fetch real reviews from Supabase for this farmer
  useEffect(() => {
    if (farmer?.id && fetchFarmerReviews) {
      fetchFarmerReviews(farmer.id);
    }
  }, [farmer?.id]);

  // Tab State
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'products' | 'reviews'

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editInkhundla, setEditInkhundla] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editError, setEditError] = useState('');

  if (!farmer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Farmer Profile Not Found</h2>
        <p className="text-xs text-slate-500">The requested farmer profile does not exist or has not registered yet.</p>
        <button onClick={() => navigate('/farmers')} className="px-5 py-2.5 bg-brand-forest text-white font-bold rounded-xl text-xs hover:bg-brand-dark transition-colors cursor-pointer">
          Browse Registered Farmers
        </button>
      </div>
    );
  }

  // Filter listings belonging to this specific farmer
  const farmerListings = (listings || []).filter(l =>
    l.farmer_id === farmer.id ||
    (farmer.name && l.farmer_name && l.farmer_name.toLowerCase() === farmer.name.toLowerCase())
  );

  // Filter real reviews for this farmer
  const farmerReviews = (reviews || []).filter(r => r.farmer_id === farmer.id);
  const totalReviewsCount = farmerReviews.length;
  const averageRating = totalReviewsCount > 0
    ? (farmerReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviewsCount).toFixed(1)
    : null;

  const handleContact = () => {
    sendMessage(farmer.id, farmer.name, `Hello ${farmer.name}, I found your farm profile on Farm Connect Eswatini...`);
    navigate('/messages');
  };

  // Open Edit Modal with current values
  const handleOpenEditModal = () => {
    setEditName(farmer.name || '');
    setEditAbout(farmer.about || '');
    setEditLocation(farmer.location || '');
    setEditInkhundla(farmer.inkhundla || '');
    setEditPhone(farmer.phone || '');
    setAvatarPreview(farmer.avatar || '');
    setAvatarFile(null);
    setCoverPreview(farmer.cover || '');
    setCoverFile(null);
    setEditError('');
    setIsEditModalOpen(true);
  };

  // Handle Avatar image file selection with validation
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setEditError('Unsupported image format. Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditError('Image file is too large. Maximum file size is 5MB.');
      return;
    }

    setEditError('');
    setAvatarFile(file);
    try {
      const preview = await compressImage(file, 400, 0.8);
      setAvatarPreview(preview);
    } catch {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle Cover image file selection with validation
  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setEditError('Unsupported image format. Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditError('Cover image file is too large. Maximum file size is 5MB.');
      return;
    }

    setEditError('');
    setCoverFile(file);
    try {
      const preview = await compressImage(file, 1200, 0.8);
      setCoverPreview(preview);
    } catch {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');

    // Ownership guard: only the authenticated owner can save
    if (!user) {
      setEditError('You must be signed in to edit your profile.');
      return;
    }
    if (!isCurrentUser) {
      setEditError('Access denied: You can only edit your own farmer profile.');
      return;
    }

    if (!editName.trim()) {
      setEditError('Farmer or business name is required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      let finalAvatarUrl = avatarPreview;
      let finalCoverUrl = coverPreview;

      // Upload avatar to storage if changed (uses authenticated user's own ID)
      if (avatarFile) {
        const uploadedAvatar = await uploadProfileImageToStorage(avatarFile, user.id, 'avatar');
        if (uploadedAvatar) {
          finalAvatarUrl = uploadedAvatar;
        }
      }

      // Upload cover to storage if changed (uses authenticated user's own ID)
      if (coverFile) {
        const uploadedCover = await uploadProfileImageToStorage(coverFile, user.id, 'cover');
        if (uploadedCover) {
          finalCoverUrl = uploadedCover;
        }
      }

      await updateUserProfile({
        full_name: editName.trim(),
        about: editAbout.trim(),
        bio: editAbout.trim(),
        location: editLocation.trim(),
        inkhundla: editInkhundla.trim(),
        phone_number: editPhone.trim(),
        profile_picture_url: finalAvatarUrl,
        cover_image_url: finalCoverUrl
      });

      setIsEditModalOpen(false);
      showToast('Farmer profile updated successfully!', 'success');
    } catch (err) {
      console.error('Save profile error:', err);
      setEditError(err.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit Buyer Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to leave a review.', 'info');
      navigate('/login');
      return;
    }

    if (user.id === farmer.id || user.farmer_id === farmer.id) {
      showToast('Farmers cannot submit reviews for their own profiles.', 'error');
      return;
    }

    const trimmedComment = reviewComment.trim();
    if (trimmedComment.length < 5) {
      showToast('Please write a short review explaining your experience (at least 5 characters).', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const result = await addFarmerReview({
        farmerId: farmer.id,
        rating: reviewRating,
        comment: trimmedComment
      });

      if (result && result.success) {
        setReviewComment('');
        setReviewRating(5);
        setReviewSubmittedSuccess(true);
        setTimeout(() => setReviewSubmittedSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Review submission error:', err);
      showToast('Could not submit review. Please try again.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">

      {/* Back button */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-forest cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="h-36 sm:h-52 w-full relative bg-slate-100">
          <img src={farmer.cover} alt="Farm Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="p-5 relative space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
            <div className="flex items-end space-x-3.5">
              <img
                src={farmer.avatar}
                alt={farmer.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md bg-white shrink-0"
              />
              <div className="pt-2">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{farmer.name}</h1>
                  {farmer.is_verified && (
                    <span title="Administrator Verified Producer">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{farmer.location}</span>
                  <span>•</span>
                  <span className="text-emerald-800 font-semibold">{farmer.inkhundla || 'Ludzeludze'}</span>
                </div>
              </div>
            </div>

            {/* Actions: Contact Button & Edit Profile Button (Follow button removed) */}
            <div className="flex items-center space-x-2 shrink-0">
              {canEditProfile && (
                <button
                  onClick={handleOpenEditModal}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Edit your farmer profile information"
                >
                  <Edit3 className="w-4 h-4 text-slate-600" />
                  <span>Edit Profile</span>
                </button>
              )}

              <button
                onClick={handleContact}
                className="px-4 py-2 rounded-xl bg-brand-forest hover:bg-brand-dark text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Contact</span>
              </button>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="flex border-b border-slate-200 pt-2 space-x-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${activeTab === 'about' ? 'border-brand-forest text-brand-forest' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${activeTab === 'products' ? 'border-brand-forest text-brand-forest' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Products ({farmerListings.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${activeTab === 'reviews' ? 'border-brand-forest text-brand-forest' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Reviews ({totalReviewsCount})
            </button>
          </div>

          {/* TAB 1: ABOUT CONTENT */}
          {activeTab === 'about' && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Farming Operations & About Us</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {farmer.about || 'Welcome to our farm! We supply quality farm fresh harvests to buyers across the Kingdom of Eswatini.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Verified Harvests</span>
                    <span className="text-[10px] text-slate-500">Quality checked</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                  <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Landmark Pickup</span>
                    <span className="text-[10px] text-slate-500">Local coordinates</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                  <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Smallholder Community</span>
                    <span className="text-[10px] text-slate-500">Kingdom of Eswatini</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="pt-2">
              {farmerListings.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {farmerListings.map(listing => (
                    <ProductCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500">This farmer currently has no active produce listings on the marketplace.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REVIEWS & RATING FORM */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 pt-2">
              {/* Dynamic Average Rating Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-950">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${totalReviewsCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Star className={`w-6 h-6 ${totalReviewsCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-amber-950">
                      {totalReviewsCount > 0 ? `${averageRating} / 5` : 'Not yet rated'}
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {totalReviewsCount === 0
                        ? 'No customer reviews yet'
                        : `Based on ${totalReviewsCount} ${totalReviewsCount === 1 ? 'customer review' : 'customer reviews'}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-800 self-start sm:self-auto bg-amber-100/70 px-3 py-1.5 rounded-lg">
                  {totalReviewsCount > 0 ? 'Verified Farmer Rating' : 'New Farmer - Awaiting First Review'}
                </span>
              </div>

              {/* BUYER REVIEW SUBMISSION FORM */}
              {user ? (
                (user.id === farmer.id || user.farmer_id === farmer.id) ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
                    This is your own profile. You cannot review your own account.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                    <div className="border-b border-slate-100 pb-2.5">
                      <h3 className="font-bold text-slate-900 text-sm">Leave a Customer Review</h3>
                      <p className="text-xs text-slate-500">Share your experience with produce quality, pickup reliability, and communication.</p>
                    </div>

                    {reviewSubmittedSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Thank you! Your review has been submitted successfully.</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Star Rating Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating (1 to 5 Stars)</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                              title={`${star} Star${star > 1 ? 's' : ''}`}
                            >
                              <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-2">
                            {reviewRating} of 5 Stars
                          </span>
                        </div>
                      </div>

                      {/* Written Review */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Written Review</label>
                        <textarea
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this farmer..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-5 py-2.5 bg-brand-forest hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  </div>
                )
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>Sign in to your FarmConnect account to submit a review for {farmer.name}.</span>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-brand-forest text-white font-bold rounded-xl text-center whitespace-nowrap text-xs"
                  >
                    Sign In to Review
                  </Link>
                </div>
              )}

              {/* REVIEWS LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Customer Feedback & Ratings</h4>

                {farmerReviews.length > 0 ? (
                  <div className="space-y-3">
                    {farmerReviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {rev.reviewer_avatar ? (
                              <img src={rev.reviewer_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                                {rev.reviewer_name?.charAt(0) || 'B'}
                              </div>
                            )}
                            <span className="font-bold text-slate-900">{rev.reviewer_name || 'Verified Client'}</span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span className="text-amber-500 font-bold tracking-widest">
                              {'★'.repeat(Math.round(rev.rating || 5))}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed pl-8">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                    No customer reviews yet. Be the first to share your experience with {farmer.name}!
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 my-8 animate-scale-up">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Farmer Profile</h3>
                <p className="text-xs text-slate-500">Update your farm branding, description, and contact coordinates.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">

              {/* Cover Banner Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover / Banner Image</label>
                <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 mr-1.5" />
                    <span>Change Cover Photo</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverFileChange} className="hidden" />
                  </label>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Recommended size: 1200x400. Max: 5MB (JPG, PNG, WEBP).</span>
              </div>

              {/* Avatar Logo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Farmer Logo / Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                  <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Farmer or Business Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="e.g. Malkerns Valley Organic Farm"
                  required
                />
              </div>

              {/* About Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">About Section / Description</label>
                <textarea
                  rows={4}
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="Describe your agricultural operations, what crops or livestock you produce, and your farm heritage..."
                />
              </div>

              {/* Location & Inkhundla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Region / Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    placeholder="e.g. Manzini Region, Eswatini"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inkhundla</label>
                  <input
                    type="text"
                    value={editInkhundla}
                    onChange={(e) => setEditInkhundla(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    placeholder="e.g. Ludzeludze"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="e.g. +268 7600 0000"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-dark text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
