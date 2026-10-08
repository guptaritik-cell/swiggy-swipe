/**
 * @file PhoneMockup.tsx
 * 
 * Provides an authentic mobile viewport container.
 * - On desktop: Renders an iPhone 16 Pro frame with dynamic island and status bar.
 * - On mobile (< 768px): Seamlessly expands to 100% full-screen native viewport.
 */

import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface PhoneMockupProps {
  children: React.ReactNode;
  showDeviceFrame?: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  showDeviceFrame = true,
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {/* Container wrapper */}
      <div
        className={`relative w-full h-full md:max-w-[400px] md:h-[844px] flex flex-col bg-[#0D0D0D] overflow-hidden transition-all duration-300 ${
          showDeviceFrame
            ? 'md:rounded-[48px] md:border-[10px] md:border-[#1E1E22] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]'
            : 'md:rounded-none md:border-0'
        }`}
      >
        {/* Dynamic Island & Status Bar on desktop frame only (hidden on real mobile) */}
        <div className="hidden md:flex relative w-full shrink-0 pt-2 px-6 items-center justify-between text-white z-50 pointer-events-none select-none">
          {/* Status Time */}
          <span className="text-[13px] font-bold tracking-tight font-sans pl-1">
            9:41
          </span>

          {/* Dynamic Island pill */}
          <div className="hidden md:flex w-24 h-5 rounded-full bg-black border border-white/10 items-center justify-end px-2 gap-1.5 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[#181822] border border-white/5" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          {/* Right Status Icons (Signal, Wifi, Battery) */}
          <div className="flex items-center gap-1.5 pr-1">
            <div className="flex items-end gap-[1.5px] h-2.5">
              <span className="w-[2.5px] h-1 bg-white rounded-xs" />
              <span className="w-[2.5px] h-1.5 bg-white rounded-xs" />
              <span className="w-[2.5px] h-2 bg-white rounded-xs" />
              <span className="w-[2.5px] h-2.5 bg-white rounded-xs" />
            </div>
            <Wifi size={13} className="text-white" />
            <Battery size={15} className="text-white fill-white" />
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar on iOS */}
        <div className="shrink-0 w-full flex justify-center py-2 z-50 pointer-events-none bg-transparent">
          <div className="w-32 h-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};
