import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { api } from '../utils/api';
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '../config/firebase';
import { useBrandLogo } from '../utils/cms';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'signin' | 'register';
  targetRole?: 'BUYER' | 'KEEPER';
}

const AVATAR_SYMBOLS = [
  { symbol: '🐣', label: 'Chick' },
  { symbol: '🐔', label: 'Hen' },
  { symbol: '🐓', label: 'Rooster' },
  { symbol: '🥚', label: 'Egg' },
  { symbol: '🌾', label: 'Grain' },
  { symbol: '🚜', label: 'Tractor' },
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signin', targetRole = 'BUYER' }: AuthModalProps) {
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
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'KEEPER'>(targetRole || 'BUYER');
  
  // Status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
  };

  const handleClose = () => {
    resetForm();
    setRegisteredUser(null);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedRole(targetRole || 'BUYER');
      resetForm();
      setRegisteredUser(null);
    }
  }, [isOpen, initialMode, targetRole]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const user = await signInWithGoogle();
      const userEmail = user.email || '';
      const isAdminAccount = userEmail.toLowerCase() === 'uxagina@gmail.com' || userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase() === 'manyaos7@gmail.com';
      const loggedUser: User = {
        email: userEmail,
        name: user.displayName || (isAdminAccount ? 'Agina (Admin)' : 'Poultry Buyer'),
        avatarEmoji: isAdminAccount ? '👑' : '🐣',
        role: isAdminAccount ? 'ADMIN' : 'BUYER',
        buyerType: isAdminAccount ? 'wholesale' : 'retail'
      };
      onAuthSuccess(loggedUser);
      setSuccessMsg(`Welcome to ChickMagnet, ${loggedUser.name}!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError('Google Sign-In failed: ' + (err.message || 'unknown error'));
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
    const isAdminAccount = cleanEmail === 'uxagina@gmail.com' || cleanEmail.includes('admin') || cleanEmail === 'manyaos7@gmail.com';

    try {
      const fbUser = await signInWithEmail(cleanEmail, password);
      const loggedUser: User = {
        email: fbUser.email || cleanEmail,
        name: fbUser.displayName || (isAdminAccount ? 'Agina (Admin)' : cleanEmail.split('@')[0]),
        avatarEmoji: isAdminAccount ? '👑' : '🐣',
        role: isAdminAccount ? 'ADMIN' : (targetRole || 'BUYER'),
        buyerType: isAdminAccount ? 'wholesale' : 'retail'
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
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
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
    const isAdminAccount = cleanEmail === 'uxagina@gmail.com' || cleanEmail.includes('admin') || cleanEmail === 'manyaos7@gmail.com';

    try {
      const fbUser = await registerWithEmail(
        cleanEmail,
        password,
        name.trim(),
        selectedEmoji,
        isAdminAccount ? 'ADMIN' : selectedRole
      );

      const loggedUser: User = {
        email: fbUser.email || cleanEmail,
        name: name.trim(),
        avatarEmoji: selectedEmoji,
        role: (isAdminAccount ? 'ADMIN' : selectedRole) as any,
        buyerType: isAdminAccount ? 'wholesale' : 'retail'
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
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-[#0b2217]/80 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-2 border-emerald-800 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10 my-auto text-emerald-950"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-emerald-800 hover:text-emerald-950 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
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
              Your account has been created successfully. Explore our bio-secure poultry marketplace.
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
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-full text-xs font-bold font-mono mb-2">
                📍 Kisii, Kenya
              </span>
              <h3 className="font-serif font-black text-2xl text-emerald-950">
                {mode === 'signin' ? 'Sign In to Account' : 'Create an Account'}
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
                    <label className="block text-xs font-bold text-emerald-950 font-mono">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Agina"
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
                <label className="block text-xs font-bold text-emerald-950 font-mono">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. uxagina@gmail.com"
                  className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-emerald-950 font-mono">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  required
                />
              </div>

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-emerald-950 font-mono">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                    required
                  />
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
                    I agree to the ChickMagnet Bio-Security Terms & Conditions.
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                {mode === 'signin' ? 'Sign In' : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
