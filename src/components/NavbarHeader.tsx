import React from 'react';
import { Sparkles, Smartphone, CheckCircle2, User as UserIcon, Shield, Database } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarHeaderProps {
  activeTab: 'services' | 'orders' | 'firebase_test';
  setActiveTab: (tab: 'services' | 'orders' | 'firebase_test') => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  firebaseConnected: boolean;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  activeTab,
  setActiveTab,
  isMobileFrame,
  setIsMobileFrame,
  currentUser,
  onOpenAuthModal,
  firebaseConnected
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('services')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Washy<span className="text-sky-500">Neat</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 rounded">
                  Android App
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Premium Laundry & Dry Cleaning
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'services'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Services & Booking
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Track Orders
            </button>
            <button
              onClick={() => setActiveTab('firebase_test')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'firebase_test'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Firebase Test</span>
              {firebaseConnected && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Device View Toggle */}
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              title={isMobileFrame ? "Switch to Full Layout" : "Switch to Android Frame View"}
              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
                isMobileFrame 
                  ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 border-sky-200 dark:border-sky-800' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">{isMobileFrame ? "Mobile View" : "Desktop View"}</span>
            </button>

            {/* Auth Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              {currentUser ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentUser.displayName || currentUser.email || 'User'}
                  </span>
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
