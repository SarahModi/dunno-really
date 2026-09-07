import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Crown,
  Home,
  Save
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    logoutUser,
    updateUserProfileData,
    loyaltyPoints,
    selectedLocation,
    addressDetails,
    setAddressDetails,
    residentProfile,
    setResidentProfile
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState(addressDetails.unitOrRoom || '');
  const [tower, setTower] = useState(addressDetails.towerOrBlock || '');
  const [instructions, setInstructions] = useState(addressDetails.specialInstructions || '');
  const [dietary, setDietary] = useState<'all' | 'veg' | 'non-veg'>('all');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        setSuccessMessage('Welcome back! Signed in successfully.');
        setTimeout(() => onClose(), 1200);
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name, phone, {
          unitOrRoom: room,
          towerOrBlock: tower,
          specialInstructions: instructions
        });
        setSuccessMessage('Resident account created! Welcome to Drool.');
        setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check credentials.';
      setErrorMessage(msg.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMessage('Signed in with Google!');
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMessage(err.message?.replace('Firebase: ', '') || 'Google sign-in was cancelled or blocked.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await updateUserProfileData({
        displayName: name || residentProfile.name,
        phone: phone || residentProfile.phone,
        unitOrRoom: room,
        towerOrBlock: tower,
        specialInstructions: instructions,
        dietaryPreference: dietary
      });
      // update local state too
      setAddressDetails({
        unitOrRoom: room,
        towerOrBlock: tower,
        specialInstructions: instructions
      });
      setResidentProfile(prev => ({
        ...prev,
        name: name || prev.name,
        phone: phone || prev.phone
      }));
      setSuccessMessage('Delivery address & preferences saved to cloud!');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setErrorMessage('Could not update profile: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="auth-modal-content"
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-amber-200 text-stone-900 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors border border-stone-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* If user is signed in, show resident profile editor */}
        {currentUser && !currentUser.isAnonymous ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-rose-600/25">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'R'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg text-stone-900 leading-tight">
                    {currentUser.displayName || 'Drool & Burp Resident'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Live Cloud
                  </span>
                </div>
                <p className="text-xs text-stone-500">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1 text-xs font-bold text-rose-600">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>{loyaltyPoints} Burp Coins Rewards</span>
                </div>
              </div>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Address & Preferences Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input 
                    id="profile-name-input"
                    type="text"
                    defaultValue={currentUser.displayName || residentProfile.name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    placeholder="e.g. Sarah Modi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Phone (For Gate OTP & Rider Call)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input 
                    id="profile-phone-input"
                    type="tel"
                    defaultValue={currentUser.phone || residentProfile.phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Room / Flat No.
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input 
                      id="profile-room-input"
                      type="text"
                      value={room}
                      onChange={e => setRoom(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                      placeholder="Room 304"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Tower / Wing
                  </label>
                  <input 
                    id="profile-tower-input"
                    type="text"
                    value={tower}
                    onChange={e => setTower(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    placeholder="B-Wing, 3rd Floor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Gate Delivery Instructions
                </label>
                <textarea 
                  id="profile-instructions-input"
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  placeholder="Leave with security guard if not answering bell..."
                />
              </div>

              {/* Dietary Filter Preference */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Dietary Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="pref-all-btn"
                    onClick={() => setDietary('all')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      dietary === 'all'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-300'
                        : 'border-stone-200 bg-white text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🍽️ All Dishes
                  </button>
                  <button
                    type="button"
                    id="pref-veg-btn"
                    onClick={() => setDietary('veg')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      dietary === 'veg'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-300'
                        : 'border-stone-200 bg-white text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🌱 Pure Veg
                  </button>
                  <button
                    type="button"
                    id="pref-nonveg-btn"
                    onClick={() => setDietary('non-veg')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      dietary === 'non-veg'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-300'
                        : 'border-stone-200 bg-white text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🍗 Non-Veg
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  id="save-profile-btn"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black py-3 px-4 rounded-xl text-xs shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Cloud Profile'}
                </button>

                <button
                  type="button"
                  id="logout-btn"
                  onClick={async () => {
                    await logoutUser();
                    onClose();
                  }}
                  className="px-3 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-stone-500" />
                  Sign Out
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-600/25">
                <Sparkles className="w-7 h-7 fill-white text-white" />
              </div>
              <h3 className="font-display font-black text-2xl text-stone-900">
                {mode === 'signin' ? 'Craving Starts Here' : 'Join Drool & Burp'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {mode === 'signin' 
                  ? 'Sign in to access your orders, Burp Coins, and shared flat orders.' 
                  : 'Register your PG or apartment to unlock pooled delivery and chef specials.'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full mb-4 flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-bold text-xs text-stone-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider absolute">
                Or with Email
              </span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input 
                        id="signup-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        placeholder="Sarah Modi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input 
                        id="signup-phone-input"
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Room / Flat
                      </label>
                      <input 
                        id="signup-room-input"
                        type="text"
                        value={room}
                        onChange={e => setRoom(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        placeholder="Room 304"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Tower / Wing
                      </label>
                      <input 
                        id="signup-tower-input"
                        type="text"
                        value={tower}
                        onChange={e => setTower(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        placeholder="B-Wing"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input 
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    placeholder="sarah@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input 
                    id="auth-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-amber-50/40 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black py-3 px-4 rounded-xl text-xs shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isLoading 
                  ? 'Connecting...' 
                  : mode === 'signin' 
                  ? 'Sign In to Drool & Burp' 
                  : 'Create Resident Account'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-stone-200 text-center">
              {mode === 'signin' ? (
                <p className="text-xs text-stone-500">
                  New resident in {selectedLocation.name}?{' '}
                  <button
                    type="button"
                    id="switch-to-signup-btn"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-stone-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    id="switch-to-signin-btn"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
