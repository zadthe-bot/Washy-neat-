import React, { useState } from 'react';
import { 
  Shirt, 
  Sparkles, 
  Briefcase, 
  Footprints, 
  BedDouble, 
  ShieldAlert, 
  Plus, 
  Minus, 
  Search,
  Clock,
  Check
} from 'lucide-react';
import { WASHY_NEAT_SERVICES } from '../data/services';
import { CartItem, ServiceItem } from '../types';

interface ServicesGridProps {
  cart: CartItem[];
  onUpdateQuantity: (service: ServiceItem, delta: number) => void;
  onProceedToCheckout: () => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  cart,
  onUpdateQuantity,
  onProceedToCheckout
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt': return <Shirt className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'Footprints': return <Footprints className="w-6 h-6" />;
      case 'BedDouble': return <BedDouble className="w-6 h-6" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
      default: return <Shirt className="w-6 h-6" />;
    }
  };

  const getItemQuantity = (serviceId: string) => {
    const item = cart.find(c => c.service.id === serviceId);
    return item ? item.quantity : 0;
  };

  const filteredServices = WASHY_NEAT_SERVICES.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cart.reduce((acc, item) => acc + (item.service.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Search & Category Filter */}
      <div className="space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laundry services, dry cleaning, shoe care..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'wash', label: 'Wash & Fold' },
            { id: 'iron', label: 'Steam Iron' },
            { id: 'dry_clean', label: 'Dry Clean' },
            { id: 'shoes', label: 'Shoe Care' },
            { id: 'heavy', label: 'Bedding & Rugs' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => {
          const qty = getItemQuantity(service.id);
          return (
            <div
              key={service.id}
              className={`p-5 bg-white dark:bg-slate-800/80 rounded-2xl border transition-all flex flex-col justify-between ${
                qty > 0 
                  ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20 dark:bg-slate-800' 
                  : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    qty > 0 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                  }`}>
                    {renderIcon(service.iconName)}
                  </div>
                  
                  {service.popular && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                      POPULAR
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Duration */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Est. turnaround: {service.estimatedTime}</span>
                </div>
              </div>

              {/* Price & Quantity Controls */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    ${service.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    /{service.unit}
                  </span>
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => onUpdateQuantity(service, 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/80 p-1 rounded-xl">
                    <button
                      onClick={() => onUpdateQuantity(service, -1)}
                      className="w-7 h-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm hover:bg-slate-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 dark:text-white px-2 min-w-[20px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(service, 1)}
                      className="w-7 h-7 bg-sky-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm hover:bg-sky-400"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Checkout Floating Bar */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-xl bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">
                {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} selected
              </span>
            </div>
            <div className="text-lg font-black mt-0.5">
              Subtotal: ${totalCartAmount.toFixed(2)}
            </div>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="px-5 py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <span>Proceed to Pickup</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
