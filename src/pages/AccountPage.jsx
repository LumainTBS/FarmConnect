import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Trash2, AlertTriangle, Upload, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANZINI_INKHUNDLA_LIST } from '../lib/supabase';

export default function AccountPage() {
  const { user, updateUserProfile, logoutUser, showToast } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [profilePic, setProfilePic] = useState(user?.profile_picture_url || '');
  const [settlementType, setSettlementType] = useState(user?.settlement_type || 'rural');
  const [inkhundla, setInkhundla] = useState(user?.inkhundla || MANZINI_INKHUNDLA_LIST[0]);
  const [streetAddress, setStreetAddress] = useState(user?.street_address || '');
  const [idDocumentUrl, setIdDocumentUrl] = useState(user?.id_document_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync state when user changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setProfilePic(user.profile_picture_url || '');
      setSettlementType(user.settlement_type || 'rural');
      setInkhundla(user.inkhundla || MANZINI_INKHUNDLA_LIST[0]);
      setStreetAddress(user.street_address || '');
      setIdDocumentUrl(user.id_document_url || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold">Please log in to access account settings</h2>
        <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-brand-forest text-white font-bold rounded-xl text-xs">
          Log In
        </button>
      </div>
    );
  }

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target.result) {
        setProfilePic(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleIdDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target.result) {
        setIdDocumentUrl(event.target.result);
        showToast('Proof of residency / ID attached. Click "Save Profile Changes" to submit.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const isRural = settlementType === 'rural';
    const computedLocation = isRural 
      ? `${inkhundla}, Manzini Region` 
      : `${streetAddress}, Urban`;

    const updatedFields = {
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      profile_picture_url: profilePic,
      settlement_type: settlementType,
      inkhundla: isRural ? inkhundla : null,
      street_address: !isRural ? streetAddress : null,
      location: computedLocation,
      id_document_url: idDocumentUrl || null,
      verification_status: idDocumentUrl ? (user.is_verified ? 'approved' : 'pending') : (user.verification_status || 'unsubmitted')
    };

    await updateUserProfile(updatedFields);
    setIsSaving(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    logoutUser();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500">Manage your profile, settlement location, and security settings.</p>
      </div>

      {/* User Header Card with Subtle H7.png Background & Glassmorphism */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-emerald-700/40 p-6 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-center gap-5"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(10, 36, 22, 0.94) 0%, rgba(13, 74, 43, 0.88) 55%, rgba(6, 78, 59, 0.82) 100%), url('/images/H7.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative group shrink-0 z-10">
          <img 
            src={profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
            alt={user.full_name} 
            className="w-20 h-20 rounded-full object-cover border-4 border-emerald-400 shadow-md" 
          />
          <label className="absolute bottom-0 right-0 bg-emerald-500 text-slate-950 p-1.5 rounded-full hover:bg-emerald-400 cursor-pointer shadow-md transition-transform hover:scale-105">
            <Camera className="w-3.5 h-3.5" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProfileImageUpload} 
              className="hidden" 
            />
          </label>
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1 z-10">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <h2 className="font-extrabold text-white text-xl truncate">{user.full_name}</h2>
            {user.is_verified && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          </div>
          <p className="text-xs text-emerald-100/90 truncate">{user.email || user.phone_number}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold capitalize">
              Role: {user.role}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
              user.is_verified || user.verification_status === 'approved'
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                : user.verification_status === 'pending'
                ? 'bg-amber-500/30 text-amber-200 border-amber-400/40'
                : 'bg-white/10 text-white/80 border-white/20'
            }`}>
              Verification: {user.is_verified ? 'Approved' : (user.verification_status || 'Pending Verification')}
            </span>
          </div>
        </div>
      </div>

      {/* Profile & Location Form */}
      <form onSubmit={handleSaveChanges} className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Profile & Location Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+268 7612 3456"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
            />
          </div>

          {/* Settlement & Location */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Farm Location & Settlement</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Settlement Type</label>
                <select
                  value={settlementType}
                  onChange={(e) => setSettlementType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
                >
                  <option value="rural">Rural (Chiefdom / Inkhundla)</option>
                  <option value="urban">Urban (Town / City / Street)</option>
                </select>
              </div>

              {settlementType === 'rural' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Inkhundla (Constituency)</label>
                  <select
                    value={inkhundla}
                    onChange={(e) => setInkhundla(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
                  >
                    {MANZINI_INKHUNDLA_LIST.map((ink) => (
                      <option key={ink} value={ink}>{ink}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street / House / Farm Address</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. Plot 14, Malkerns Road"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ID / Proof of Residency Upload Section */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                ID / Proof of Residency Document
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                idDocumentUrl ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {idDocumentUrl ? 'Document Attached' : 'Not Uploaded'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Upload your National ID, Chief's letter, or utility proof of residency to verify your farmer profile.
            </p>
            <label className="flex items-center space-x-2 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-brand-forest" />
              <span className="text-xs font-semibold text-slate-700">
                {idDocumentUrl ? 'Change Uploaded Verification Document' : 'Upload ID / Proof Document'}
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleIdDocumentUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-brand-forest text-white font-bold text-xs hover:bg-brand-dark transition-colors shadow-xs cursor-pointer"
        >
          {isSaving ? 'Saving to Database...' : 'Save Profile Changes'}
        </button>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 space-y-3">
        <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Danger Zone</span>
        </div>
        <p className="text-xs text-rose-700">
          Once deleted, your profile, produce listings, and plant logs will be permanently removed.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete {user.role === 'farmer' ? 'Farmer Profile & Account' : 'Account'}</span>
        </button>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 z-10 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Delete Account?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete your {user.role} profile? This action cannot be undone.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
