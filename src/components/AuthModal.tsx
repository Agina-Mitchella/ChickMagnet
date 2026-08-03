import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { api } from '../utils/api';
import { signInWithGoogle } from '../config/firebase';

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
      const loggedUser: User = {
        email: user.email || '',
        name: user.displayName || 'Poultry Buyer',
        avatarEmoji: '🐣',
        role: 'BUYER',
        buyerType: 'retail'
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

    try {
      const response = await api.auth.login(email);
      const loggedUser = response.user;
      
      onAuthSuccess(loggedUser);
      setSuccessMsg(`Welcome back to ChickMagnet, ${loggedUser.name}.`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      console.warn('Backend connection failed, checking local fallback:', err);
      
      const isDemo = email.trim().toLowerCase() === 'user@example.com' && password === 'password';
      
      const savedUsersStr = localStorage.getItem('chickmagnet_registered_users');
      let registeredUsers: any[] = [];
      if (savedUsersStr) {
        try {
          registeredUsers = JSON.parse(savedUsersStr);
        } catch (e) {
          console.error('Failed to parse registered users');
        }
      }

      const foundUser = registeredUsers.find(
        u => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (isDemo) {
        const demoUser: User = {
          email: 'uxagina@gmail.com',
          name: 'Agina',
          avatarEmoji: '🐣',
          role: 'BUYER',
          buyerType: 'retail'
        };
        onAuthSuccess(demoUser);
        setSuccessMsg('Welcome back!');
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1000);
      } else if (foundUser) {
        const loggedUser: User = {
          email: foundUser.email,
          name: foundUser.name,
          avatarEmoji: foundUser.avatarEmoji,
          role: foundUser.role || targetRole || 'BUYER',
          buyerType: foundUser.buyerType || 'retail'
        };
        onAuthSuccess(loggedUser);
        setSuccessMsg(`Welcome back, ${loggedUser.name}.`);
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1000);
      } else {
        setError('Invalid email or password. You can register a new account or try user@example.com / password');
      }
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
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the terms and conditions to register.');
      return;
    }

    try {
      const response = await api.auth.register({
        email,
        name,
        avatarEmoji: selectedEmoji,
        role: selectedRole,
        buyerType: 'retail'
      });
      const loggedUser = response.user;

      resetForm();
      onAuthSuccess(loggedUser);
      setRegisteredUser(loggedUser);
      setMode('welcome');
    } catch (err: any) {
      console.warn('Backend registration failed, using local fallback:', err);
      
      const savedUsersStr = localStorage.getItem('chickmagnet_registered_users') || '[]';
      let registeredUsers: any[] = [];
      try {
        registeredUsers = JSON.parse(savedUsersStr);
      } catch (e) {
        registeredUsers = [];
      }

      const emailExists = registeredUsers.some(
        u => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      ) || email.trim().toLowerCase() === 'user@example.com';

      if (emailExists) {
        setError('An account with this email already exists.');
        return;
      }

      const newUserRecord = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        avatarEmoji: selectedEmoji,
        role: selectedRole,
        buyerType: 'retail'
      };

      registeredUsers.push(newUserRecord);
      localStorage.setItem('chickmagnet_registered_users', JSON.stringify(registeredUsers));

      const loggedUser: User = {
        email: newUserRecord.email,
        name: newUserRecord.name,
        avatarEmoji: newUserRecord.avatarEmoji,
        role: newUserRecord.role as any,
        buyerType: 'retail'
      };
      
      resetForm();
      onAuthSuccess(loggedUser);
      setRegisteredUser(loggedUser);
      setMode('welcome');
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
              Welcome to ChickMagnet, {registeredUser?.name}!
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
