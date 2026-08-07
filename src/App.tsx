import React, { useState, useEffect } from 'react';
import { NavbarHeader } from './components/NavbarHeader';
import { ServicesGrid } from './components/ServicesGrid';
import { PickupScheduler } from './components/PickupScheduler';
import { OrderTracker } from './components/OrderTracker';
import { FirebaseTestScreen } from './components/FirebaseTestScreen';
import { UserAuthModal } from './components/UserAuthModal';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { CartItem, ServiceItem } from './types';
import { auth, onAuthStateChanged, testFirebaseConnection } from './firebase';
import { User } from 'firebase/auth';
import { Sparkles, Database, CheckCircle2, ShieldCheck, Phone, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'services' | 'scheduler' | 'orders' | 'firebase_test'>('services');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Firebase connection test on boot
  useEffect(() => {
    testFirebaseConnection().then((res) => {
      setFirebaseConnected(res.connected);
    });
  }, []);

  // Quantity updates
  const handleUpdateQuantity = (service: ServiceItem, delta: number) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.service.id === service.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prevCart.filter(item => item.service.id !== service.id);
        }
        return prevCart.map(item => item.service.id === service.id ? { ...item, quantity: newQty } : item);
      } else if (delta > 0) {
        return [...prevCart, { service, quantity: delta }];
      }
      return prevCart;
    });
  };

  const handleOrderSuccess = (orderId: string) => {
    setCompletedOrderId(orderId);
    setCart([]);
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-sky-500 selection:text-white font-sans antialiased">
      
      <AndroidDeviceFrame 
        isMobileFrame={isMobileFrame} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      >
        {/* Navigation Bar */}
        <NavbarHeader
          activeTab={activeTab === 'scheduler' ? 'services' : activeTab}
          setActiveTab={(tab) => setActiveTab(tab as any)}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          currentUser={currentUser}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          firebaseConnected={firebaseConnected}
        />

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          
          {/* Welcome Banner */}
          {activeTab === 'services' && (
            <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Door-to-Door Laundry & Dry Cleaning</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Fresh, Clean Clothes Picked Up & Delivered to Your Door
                </h2>
                <p className="text-xs sm:text-sm text-sky-100 mt-2">
                  Eco-friendly wash, crisp steam pressing, and sneaker care. Track live order status powered by Cloud Firestore.
                </p>
              </div>
            </div>
          )}

          {/* Active View Switcher */}
          {activeTab === 'services' && (
            <ServicesGrid
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onProceedToCheckout={() => setActiveTab('scheduler')}
            />
          )}

          {activeTab === 'scheduler' && (
            <PickupScheduler
              cart={cart}
              currentUser={currentUser}
              onBackToServices={() => setActiveTab('services')}
              onOrderSuccess={handleOrderSuccess}
            />
          )}

          {activeTab === 'orders' && (
            <OrderTracker
              currentUser={currentUser}
              latestOrderId={completedOrderId}
              onNewBookingClick={() => setActiveTab('services')}
            />
          )}

          {activeTab === 'firebase_test' && (
            <FirebaseTestScreen />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-bold text-slate-900 dark:text-white">Washy Neat</span>
              <span>• Android Mobile Application</span>
            </div>
            
            <div className="flex items-center gap-4 text-[11px]">
              <button 
                onClick={() => setActiveTab('firebase_test')} 
                className="hover:text-sky-500 flex items-center gap-1 font-mono"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Firebase Status</span>
              </button>
              <span>Capacitor 8.5.0</span>
            </div>
          </div>
        </footer>

      </AndroidDeviceFrame>

      {/* User Auth Dialog */}
      <UserAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
      />

    </div>
  );
}
