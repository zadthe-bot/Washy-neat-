import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Shirt, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { subscribeToUserOrders, WashyNeatOrder, db } from '../firebase';
import { User } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface OrderTrackerProps {
  currentUser: User | null;
  latestOrderId?: string | null;
  onNewBookingClick: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  currentUser,
  latestOrderId,
  onNewBookingClick
}) => {
  const [orders, setOrders] = useState<WashyNeatOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = currentUser?.uid || 'guest_user';

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToUserOrders(userId, (fetchedOrders) => {
      if (fetchedOrders && fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
      } else {
        // Mock demo order if none exist yet in Firestore
        setOrders([
          {
            id: latestOrderId || 'ord_982143',
            userId,
            userName: currentUser?.displayName || 'Washy Neat Member',
            userPhone: '+1 (555) 019-2834',
            services: [
              { serviceId: 'wash_fold', serviceName: 'Wash & Fold', quantity: 5, pricePerUnit: 3.50 },
              { serviceId: 'wash_iron', serviceName: 'Wash & Steam Iron', quantity: 3, pricePerUnit: 2.20 }
            ],
            pickupDate: new Date().toISOString().split('T')[0],
            pickupTimeSlot: '08:00 AM - 11:00 AM',
            deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            address: '452 Green Park Avenue, Apt 4B',
            specialInstructions: 'Fragrance free detergent preferred.',
            totalAmount: 27.60,
            status: 'In Washing',
            paymentMethod: 'Cash on Delivery',
            paymentStatus: 'Pending'
          }
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, latestOrderId]);

  const stages: WashyNeatOrder['status'][] = [
    'Order Placed',
    'Picked Up',
    'In Washing',
    'Ironing & Folding',
    'Out for Delivery',
    'Delivered'
  ];

  const getStageIndex = (status: WashyNeatOrder['status']) => {
    const idx = stages.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const handleAdvanceStatus = async (order: WashyNeatOrder) => {
    const currentIdx = getStageIndex(order.status);
    if (currentIdx < stages.length - 1) {
      const nextStatus = stages[currentIdx + 1];
      
      // Update local state first
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));

      // Attempt Firestore update
      if (order.id && !order.id.startsWith('ord_')) {
        try {
          await updateDoc(doc(db, 'washy_neat_orders', order.id), {
            status: nextStatus,
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.warn("Firestore update skipped:", e);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Live Order Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status updates synced with Cloud Firestore.
          </p>
        </div>

        <button
          onClick={onNewBookingClick}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Laundry Booking</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-500" />
          <span>Loading order status...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No active orders</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any pending laundry orders. Select a service to schedule a pickup!
          </p>
          <button
            onClick={onNewBookingClick}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold mt-2 inline-block"
          >
            Book First Service
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => {
            const currentStageIdx = getStageIndex(order.status);
            const progressPercent = Math.round(((currentStageIdx + 1) / stages.length) * 100);

            return (
              <div
                key={order.id || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                        #{order.id?.slice(0, 10).toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Scheduled Pickup: {order.pickupDate} ({order.pickupTimeSlot})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Status Timeline Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Order Progress</span>
                    <span className="text-sky-500">{progressPercent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-teal-400 h-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Stage Nodes */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                    {stages.map((stageName, sIdx) => {
                      const isDone = sIdx <= currentStageIdx;
                      const isCurrent = sIdx === currentStageIdx;
                      return (
                        <div
                          key={stageName}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-sky-500 text-white border-sky-500 shadow-sm font-bold'
                              : isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] block line-clamp-1">{stageName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items Summary & Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Items in Wash</h4>
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {order.services.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.quantity}x {item.serviceName}</span>
                          <span className="font-mono">${(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      <span>Delivery Location</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {order.address}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-sky-500" />
                      <span>Driver Contact: {order.userPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Demo Action to Simulate Live Status Advance */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 italic">
                    {order.status === 'Delivered' ? 'Order complete!' : 'Simulate driver updating status:'}
                  </span>

                  {order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
                    >
                      Advance Status →
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
