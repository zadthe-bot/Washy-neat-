import React from 'react';
import { Wifi, BatteryMedium, Signal, ChevronLeft, Circle, Square } from 'lucide-react';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  isMobileFrame,
  activeTab,
  setActiveTab
}) => {
  if (!isMobileFrame) {
    return <>{children}</>;
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="py-6 flex justify-center bg-slate-950 min-h-screen px-2">
      {/* Android Device Shell */}
      <div className="w-full max-w-[420px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col relative overflow-hidden my-auto">
        
        {/* Top Status Bar */}
        <div className="bg-slate-900 text-slate-100 text-[11px] font-semibold px-6 pt-3 pb-2 flex items-center justify-between select-none z-30 shrink-0">
          <span>{currentTime}</span>

          {/* Center Punch Hole Camera */}
          <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800 shadow-inner" />

          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Device Content Screen */}
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex-1 overflow-y-auto rounded-[32px] overflow-hidden flex flex-col min-h-[680px] max-h-[800px] scrollbar-none relative">
          {children}
        </div>

        {/* Bottom Android Navigation Bar */}
        <div className="bg-slate-900 pt-2 pb-1 px-8 flex items-center justify-around text-slate-400 select-none z-30 shrink-0">
          <button 
            onClick={() => setActiveTab('services')}
            className="p-1 hover:text-white transition-colors"
            title="Back / Home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setActiveTab('services')}
            className="p-1 hover:text-white transition-colors"
            title="Home"
          >
            <Circle className="w-4 h-4 fill-slate-400" />
          </button>

          <button 
            onClick={() => setActiveTab('firebase_test')}
            className="p-1 hover:text-white transition-colors"
            title="Overview / Firebase Test"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
