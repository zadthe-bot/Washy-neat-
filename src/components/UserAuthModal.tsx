import React, { useState } from 'react';
import { X, ShieldCheck, LogOut, User, Sparkles, Loader2 } from 'lucide-react';
import { loginWithGoogle, loginAnonymously, logoutUser } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError("Google Sign-In was cancelled or not supported in this preview frame. You can use Guest Login below.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAnonymously();
      onClose();
    } catch (err: any) {
      console.error("Anonymous Auth error:", err);
      setError("Guest login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-slate-900 dark:text-white">
            Washy Neat Account
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to track orders, save pickup addresses, and sync with Cloud Firestore.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 rounded-xl text-xs mb-4 border border-amber-200">
            {error}
          </div>
        )}

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
              <User className="w-10 h-10 text-sky-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {currentUser.displayName || 'Washy Neat Member'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {currentUser.email || currentUser.uid}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-sky-400" />}
              <span>Sign In with Google</span>
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span>Continue as Guest</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
