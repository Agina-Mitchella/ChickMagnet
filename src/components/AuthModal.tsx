import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { getFirebaseAuthorization, signInWithGoogle, signInWithEmail, registerWithEmail } from '../config/firebase';
import { useBrandLogo } from '../utils/cms';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'signin' | 'register';
}

const AVATAR_SYMBOLS = [
  { symbol: '🐣', label: 'Chick' },
  { symbol: '🐔', label: 'Hen' },
  { symbol: '🐓', label: 'Rooster' },
  { symbol: '🥚', label: 'Egg' },
  { symbol: '🌾', label: 'Grain' },
  { symbol: '🚜', label: 'Tractor' },
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signin' }: AuthModalProps) {
  const brand = useBrandLogo();
  const [mode, setMode] = useState<'signin' | 'register' | 'welcome'>(initialMode);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🐣');
  const [acceptTerms, setAcceptTerms] = useState(false);
  // Status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setName('');
    setSelectedEmoji('🐣');
    setAcceptTerms(false);
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    setRegisteredUser(null);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetForm();
      setRegisteredUser(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await signInWithGoogle();
      const userEmail = user.email || '';
      const authorization = await getFirebaseAuthorization(user);
      const loggedUser: User = {
        uid: user.uid,
        email: userEmail,
        name: user.displayName || 'Poultry Buyer',
        avatarEmoji: authorization.isAdmin ? '👑' : '🐣',
        role: authorization.isAdmin ? 'ADMIN' : 'BUYER',
        buyerType: 'retail',
        customClaims: authorization.claims,
      };
      onAuthSuccess(loggedUser);
      setSuccessMsg(`Welcome to ChickMagnet, ${loggedUser.name}!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError('Google sign-in could not be completed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all field boxes.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    setIsSubmitting(true);
    try {
      const fbUser = await signInWithEmail(cleanEmail, password);
      const authorization = await getFirebaseAuthorization(fbUser);
      const loggedUser: User = {
        uid: fbUser.uid,
        email: fbUser.email || cleanEmail,
        name: fbUser.displayName || cleanEmail.split('@')[0],
        avatarEmoji: authorization.isAdmin ? '👑' : '🐣',
        role: authorization.isAdmin ? 'ADMIN' : 'BUYER',
        buyerType: 'retail',
        customClaims: authorization.claims,
      };
      
      onAuthSuccess(loggedUser);
      setSuccessMsg(`Welcome back to ChickMagnet, ${loggedUser.name}.`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      console.warn('Firebase Auth sign-in failed:', err);
      let errMsg = 'Failed to sign in. Please check your email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errMsg = 'Invalid email or password. If you are a new user, please register first.';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = 'Access temporarily disabled due to many failed attempts. Please try again later.';
      }
      setError(errMsg);
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the terms and conditions to register.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    setIsSubmitting(true);
    try {
      const fbUser = await registerWithEmail(
        cleanEmail,
        password,
        name.trim(),
        selectedEmoji
      );
      const authorization = await getFirebaseAuthorization(fbUser);

      const loggedUser: User = {
        uid: fbUser.uid,
        email: fbUser.email || cleanEmail,
        name: name.trim(),
        avatarEmoji: selectedEmoji,
        role: authorization.isAdmin ? 'ADMIN' : 'BUYER',
        buyerType: 'retail',
        customClaims: authorization.claims,
      };

      resetForm();
      onAuthSuccess(loggedUser);
      setRegisteredUser(loggedUser);
      setMode('welcome');
    } catch (err: any) {
      console.warn('Firebase Auth registration error:', err);
      let errMsg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      }
      setError(errMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-[#0b2217]/80 backdrop-blur-md"
        aria-hidden="true"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-2 border-emerald-800 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10 my-auto text-emerald-950"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-emerald-800 hover:text-emerald-950 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
          aria-label="Close account dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'welcome' ? (
          <div className="text-center py-4 flex flex-col items-center">
            <div className="text-6xl mb-4">{registeredUser?.avatarEmoji || '🐣'}</div>
            <h3 className="font-serif font-black text-2xl text-emerald-950">
              Welcome to {brand.brandName || 'ChickMagnet'}, {registeredUser?.name}!
            </h3>
            <p className="text-xs text-emerald-800 mt-2">
              Your account is ready. You can now shop and keep track of your orders.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Start Exploring Catalog
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h3 id="auth-modal-title" className="px-8 font-serif text-xl font-black text-emerald-950 sm:text-2xl">
                {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
              </h3>

              <div className="mt-4 p-1 bg-emerald-50 border border-emerald-200 rounded-xl flex">
                <button
                  onClick={() => { setMode('signin'); resetForm(); }}
                  className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    mode === 'signin' ? 'bg-emerald-800 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-950'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('register'); resetForm(); }}
                  className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    mode === 'register' ? 'bg-emerald-800 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-950'
                  }`}
                >
                  Register Account
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl p-3 text-xs text-center font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={mode === 'signin' ? handleSignIn : handleRegister} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="register-name" className="block text-xs font-bold text-emerald-950 font-mono">Full name</label>
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-emerald-950 font-mono">Choose Avatar Icon</label>
                    <div className="flex gap-2">
                      {AVATAR_SYMBOLS.map(item => (
                        <button
                          key={item.symbol}
                          type="button"
                          onClick={() => setSelectedEmoji(item.symbol)}
                          aria-label={item.label}
                          aria-pressed={selectedEmoji === item.symbol}
                          className={`text-xl p-2 rounded-xl border-2 flex-1 transition-all cursor-pointer ${
                            selectedEmoji === item.symbol ? 'border-amber-500 bg-amber-50 scale-105' : 'border-emerald-200 bg-emerald-50/50'
                          }`}
                        >
                          {item.symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-email" className="block text-xs font-bold text-emerald-950 font-mono">Email address</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="auth-password" className="block text-xs font-bold text-emerald-950 font-mono">Password</label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2.5 pr-11 text-xs text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-emerald-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1">
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-emerald-950 font-mono">Confirm password</label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2.5 pr-11 text-xs text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-emerald-700"
                      aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 accent-emerald-800 rounded cursor-pointer"
                  />
                  <label htmlFor="accept-terms" className="text-xs text-emerald-900 cursor-pointer">
                    I agree to the ChickMagnet terms and conditions.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-700/60 disabled:cursor-wait text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 disabled:cursor-wait text-emerald-950 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                Sign in with Google
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
