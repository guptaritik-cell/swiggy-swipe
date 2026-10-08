/**
 * @file ScrollExtendedAnimation.tsx
 * 
 * Implements Animation 4 and exact layout from 'select size' to 'product details'
 * matching user reference images 1 & 2:
 * 1. Select size row (XS, S disabled, M active selected with '5 left', L with '10 left', XL disabled, XXL)
 * 2. Delivery • Wed, 4th Jan card with Change >
 * 3. 3-column trust badges with 0.5dp vertical dividers (Secure payments, COD available, 7 day return)
 * 4. Product details accordion
 * 5. Rating breakdown with star filled in white+greyish colour (#D4D4D8)
 * 6. "More from this brand" recommendations
 * 
 * ALSO contains the real-time Tuning Parameter Sidebar for desktop/tablet.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CreditCard,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Star,
  Sliders,
  RotateCcw as ResetIcon,
  Zap
} from 'lucide-react';
import { ProductItem, AnimationTuningConfig } from '../types/product';
import { APP_ASSETS } from '../data/productsData';

interface ScrollExtendedAnimationProps {
  product: ProductItem;
  recommendations: ProductItem[];
  scrollY?: number;
  onSelectRecommendation?: (product: ProductItem) => void;
  isCollapsed?: boolean;
  isScrolledUp?: boolean;
  onExpand?: () => void;
  showSizeSelector?: boolean;
}

/**
 * Exact 'select size' to 'product details' and extended PDP scroll sections
 */
export const ProductScrollDetailsContent: React.FC<ScrollExtendedAnimationProps> = ({
  product,
  recommendations,
  onSelectRecommendation,
  isScrolledUp = false,
  onExpand,
  showSizeSelector = false,
}) => {
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [selectedSizeId, setSelectedSizeId] = useState<string>('m');

  const ratingDistribution = [
    { stars: 5, count: 165, max: 165 },
    { stars: 4, count: 44, max: 165 },
    { stars: 3, count: 73, max: 165 },
    { stars: 2, count: 14, max: 165 },
    { stars: 1, count: 2, max: 165 },
  ];

  return (
    <div className="flex flex-col space-y-4 pt-1 pb-10 px-4 text-[#FFFFFF] bg-[#0D0D0D]">
      
      {/* ======================================================== */}
      {/* 1. SELECT SIZE CARD (Optional when rendered externally)  */}
      {/* ======================================================== */}
      {showSizeSelector && (
        <div>
          <div 
            onClick={onExpand}
            className="flex items-center justify-between mb-2.5 cursor-pointer select-none"
          >
            <span className="text-sm font-semibold text-[#FFFFFF]">Select size</span>
            <button 
              type="button"
              className="flex items-center gap-0.5 text-xs font-semibold text-[#FFFFFF] hover:text-zinc-200 transition-colors"
            >
              <span>Size chart</span>
              <ChevronRight size={14} className="text-[#FFFFFF]" />
            </button>
          </div>

          {/* Size chips: XS, S (disabled), M (active with 5 left), L (10 left), XL (disabled), XXL */}
          <motion.div
            initial={false}
            animate={{
              opacity: isScrolledUp ? 1 : 0.85,
            }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
          >
            {[
              { id: 'xs', label: 'XS', isAvailable: true },
              { id: 's', label: 'S', isAvailable: false },
              { id: 'm', label: 'M', isAvailable: true, stockLeft: 5, stockColor: '#D3970D' },
              { id: 'l', label: 'L', isAvailable: true, stockLeft: 10, stockColor: '#D3970D' },
              { id: 'xl', label: 'XL', isAvailable: false },
              { id: 'xxl', label: 'XXL', isAvailable: true },
            ].map((s) => {
              const isSelected = selectedSizeId === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center shrink-0">
                  <button
                    onClick={() => s.isAvailable && setSelectedSizeId(s.id)}
                    disabled={!s.isAvailable}
                    className={`min-w-[48px] h-[40px] px-3 rounded-[8px] text-xs font-bold transition-all border flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF] shadow-sm'
                        : s.isAvailable
                        ? 'bg-[#161616] border-[#262626] text-[#FFFFFF] hover:border-white/30'
                        : 'bg-[#161616] border-[#1F1F1F] text-[#4B4B4B] cursor-not-allowed opacity-50'
                    }`}
                  >
                    {s.label}
                  </button>
                  {s.stockLeft ? (
                    <span
                      className="text-[10px] font-semibold mt-1"
                      style={{ color: s.stockColor }}
                    >
                      {s.stockLeft} left
                    </span>
                  ) : (
                    <span className="h-[15px]" />
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DELIVERY CARD (Exact match to Reference Images 1 & 2) */}
      {/* ======================================================== */}
      <div className="p-3.5 rounded-[14px] bg-[#161616] border border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#FFFFFF] truncate">
            Delivery • Wed, 4th Jan
          </span>
          <button className="flex items-center gap-0.5 text-xs font-semibold text-[#FFFFFF] hover:text-zinc-200">
            <span>Change</span>
            <ChevronRight size={14} className="text-[#FFFFFF]" />
          </button>
        </div>
        <p className="text-[11px] text-[#71717A] mt-0.5 truncate">
          Home • 14th Sunshine View, 
        </p>
      </div>

      {/* ======================================================== */}
      {/* 3. BENEFIT CALLOUT ICONS ROW (3 columns with dividers)   */}
      {/* ======================================================== */}
      <div className="flex items-center justify-evenly py-2 px-1">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <ShieldCheck size={26} className="text-[#A1A1AA]" strokeWidth={1.6} />
          <span className="text-[10px] text-[#A1A1AA] leading-tight whitespace-pre-line">
            Secure{"\n"}payments
          </span>
        </div>

        {/* VerticalDivider 0.5px */}
        <div className="w-[0.5px] h-10 bg-[#1F1F1F]" />

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <CreditCard size={26} className="text-[#A1A1AA]" strokeWidth={1.6} />
          <span className="text-[10px] text-[#A1A1AA] leading-tight whitespace-pre-line">
            COD{"\n"}available
          </span>
        </div>

        {/* VerticalDivider 0.5px */}
        <div className="w-[0.5px] h-10 bg-[#1F1F1F]" />

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <RotateCcw size={26} className="text-[#A1A1AA]" strokeWidth={1.6} />
          <span className="text-[10px] text-[#A1A1AA] leading-tight whitespace-pre-line">
            7 day{"\n"}return
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. PRODUCT DETAILS ACCORDION                             */}
      {/* ======================================================== */}
      <div className="rounded-[14px] bg-[#161616] border border-[#1F1F1F] overflow-hidden">
        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-sm text-[#FFFFFF]"
        >
          <span>Product details</span>
          <ChevronDown
            size={18}
            className={`text-[#71717A] transition-transform duration-200 ${
              detailsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {detailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3.5 pb-3.5 text-xs text-[#A1A1AA] border-t border-[#1F1F1F] pt-2.5 whitespace-pre-line leading-relaxed"
            >
              Fabric: 100% Breathable Combed Cotton Blend{"\n"}
              Work: Signature Embroidered Cloud{"\n"}
              Occasion: Casual, Streetwear, Everyday{"\n"}
              Care: Machine wash cold with like colors
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Horizontal Divider */}
      <div className="w-full h-[0.5px] bg-[#1F1F1F] my-1" />

      {/* ======================================================== */}
      {/* 5. RATING BREAKDOWN: Star filled with white+greyish color */}
      {/* ======================================================== */}
      <div className="flex items-center gap-6 px-1 py-1">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[#FFFFFF]">4.9</span>
            {/* Star filled with white+greyish color */}
            <Star size={20} className="fill-[#D4D4D8] text-[#D4D4D8]" />
          </div>
          <span className="text-xs text-[#71717A]">1,268 ratings</span>
        </div>

        <div className="flex-1 flex flex-col space-y-1.5">
          {ratingDistribution.map((row) => {
            const fraction = Math.min(row.count / row.max, 1);
            return (
              <div key={row.stars} className="flex items-center gap-3 h-5">
                <span className="text-xs font-semibold text-[#FFFFFF] w-2">{row.stars}</span>
                <div className="flex-1 h-1 rounded-full bg-[#161616] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#FFFFFF]"
                    style={{ width: `${fraction * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="w-full h-[0.5px] bg-[#1F1F1F] my-1" />

      {/* ======================================================== */}
      {/* 6. MORE FROM THIS BRAND RECOMMENDATIONS                   */}
      {/* ======================================================== */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-[#FFFFFF]">More from this brand</h3>
          <ChevronRight size={16} className="text-[#FFFFFF]" />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {recommendations.map((rec) => (
            <div
              key={`rec-${rec.id}`}
              onClick={() => onSelectRecommendation?.(rec)}
              className="w-[156px] shrink-0 rounded-[12px] bg-[#161616] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform border border-[#1F1F1F]"
            >
              <div className="relative w-[156px] aspect-[1/1.22] bg-[#1C1C1E] overflow-hidden rounded-[12px]">
                <img
                  src={rec.images || APP_ASSETS.purpleTshirt}
                  alt={rec.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = APP_ASSETS.purpleTshirt;
                  }}
                />

                {/* Price drop badge (exact orange matching Image 2) */}
                <div className="absolute top-0 left-0 bg-[#E54D00] px-2 py-0.5 rounded-br-[6px] text-[10px] text-[#FFFFFF] font-semibold">
                  Price drop
                </div>

                {/* Rating badge with white+greyish filled star */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[rgba(0,0,0,0.60)] backdrop-blur-xs text-[10px] font-semibold text-[#FFFFFF]">
                  <Star size={10} className="fill-[#FFFFFF] text-[#FFFFFF]" />
                  <span>{rec.ratings_info?.average_rating || 4.5}</span>
                </div>
              </div>

              <div className="p-2">
                <span className="text-[10px] text-[#71717A] truncate block">
                  {rec.brand_info.name || "Bombay Shaving Company"}
                </span>
                <p className="text-xs font-semibold text-[#FFFFFF] truncate mt-0.5">
                  {rec.title}
                </p>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs font-bold text-[#FFFFFF]">
                    {rec.price.selling_price === 1000 ? "1,000" : `₹${rec.price.selling_price}`}
                  </span>
                  <span className="text-xs text-[#71717A] line-through">
                    ₹{rec.price.mrp}
                  </span>
                </div>
              </div>

              {/* Bottom Blue POPchop Offer Bar */}
              <div
                className="w-full h-8 px-2 flex items-center justify-between rounded-b-[12px]"
                style={{
                  background: 'linear-gradient(90deg, #0554DA 0%, #0062FF 100%)'
                }}
              >
                <div className="flex items-center text-xs font-semibold text-[#FFFFFF]">
                  <span>₹{rec.price.selling_price}</span>
                  <span className="mx-1 text-[#FFFFFF]">+</span>
                  <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain inline self-center mr-0.5" />
                  <span>{rec.popstar_coins || 234}</span>
                </div>

                <img src={APP_ASSETS.popChopIcon} alt="" className="w-4 h-4 object-contain opacity-90" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * TUNING PARAMETERS SIDEBAR COMPONENT (Desktop/Tablet Only, Hidden on Mobile)
 * =========================================================================
 */
interface TuningSidebarProps {
  tuning: AnimationTuningConfig;
  onUpdateTuning: (newTuning: AnimationTuningConfig) => void;
  onResetTuning: () => void;
  activeDataset: 'featured' | 'technosport' | 'fastandup';
  onDatasetChange: (dataset: 'featured' | 'technosport' | 'fastandup') => void;
  currentMode: 'all' | 'core' | 'scroll';
  onModeChange: (mode: 'all' | 'core' | 'scroll') => void;
  realtimeY?: number;
  realtimeScroll?: number;
}

export const TuningSidebar: React.FC<TuningSidebarProps> = ({
  tuning,
  onUpdateTuning,
  onResetTuning,
  activeDataset,
  onDatasetChange,
  currentMode,
  onModeChange,
  realtimeY = 0,
  realtimeScroll = 0,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const applyPreset = (presetKey: AnimationTuningConfig['selectedPreset']) => {
    switch (presetKey) {
      case 'swiggy':
        onUpdateTuning({
          ...tuning,
          selectedPreset: 'swiggy',
          springStiffness: 340,
          springDamping: 28,
          springMass: 0.85,
          dragCloseThreshold: 110,
          dragVelocityThreshold: 480,
          carouselSensitivity: 60,
          scrollCollapseDistance: 170,
        });
        break;
      case 'bouncy':
        onUpdateTuning({
          ...tuning,
          selectedPreset: 'bouncy',
          springStiffness: 420,
          springDamping: 18,
          springMass: 0.95,
          dragCloseThreshold: 90,
          dragVelocityThreshold: 350,
          carouselSensitivity: 50,
          scrollCollapseDistance: 150,
        });
        break;
      case 'snappy':
        onUpdateTuning({
          ...tuning,
          selectedPreset: 'snappy',
          springStiffness: 550,
          springDamping: 40,
          springMass: 0.6,
          dragCloseThreshold: 80,
          dragVelocityThreshold: 300,
          carouselSensitivity: 40,
          scrollCollapseDistance: 140,
        });
        break;
      case 'smooth':
        onUpdateTuning({
          ...tuning,
          selectedPreset: 'smooth',
          springStiffness: 240,
          springDamping: 32,
          springMass: 1.1,
          dragCloseThreshold: 140,
          dragVelocityThreshold: 600,
          carouselSensitivity: 80,
          scrollCollapseDistance: 210,
        });
        break;
      default:
        onUpdateTuning({ ...tuning, selectedPreset: 'custom' });
    }
  };

  return (
    <div
      className={`hidden md:flex flex-col bg-[#0D0D0D] border-l border-[#262626] transition-all duration-300 z-30 shadow-2xl h-screen overflow-hidden ${
        collapsed ? 'w-14' : 'w-80 xl:w-92'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#262626] bg-[#161616]">
        {!collapsed && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#FFFFFF]">Motion Tuning Studio</h2>
            <p className="text-[10px] text-[#71717A]">PopTheme Animation Physics</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-[8px] bg-[#0D0D0D] text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors"
          title={collapsed ? "Expand Tuning Sidebar" : "Collapse Sidebar"}
        >
          <Sliders size={16} />
        </button>
      </div>

      {/* Sidebar Scrollable Body */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs bg-[#0D0D0D]">
          
          {/* Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#A1A1AA]">
                Animation Presets
              </span>
              <button
                onClick={onResetTuning}
                className="text-[10px] text-[#71717A] hover:text-[#FFFFFF] flex items-center gap-1 transition-colors"
              >
                <ResetIcon size={10} /> Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'swiggy', label: 'Swiggy Fluid' },
                { key: 'bouncy', label: 'Bouncy Spring' },
                { key: 'snappy', label: 'Snappy Instant' },
                { key: 'smooth', label: 'Smooth Glide' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key as any)}
                  className={`px-2.5 py-2 rounded-[8px] text-left font-semibold transition-all border ${
                    tuning.selectedPreset === p.key
                      ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#000000]'
                      : 'bg-[#161616] border-[#1F1F1F] text-[#A1A1AA] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span className="block text-[11px]">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sequence Mode Switcher */}
          <div className="pt-2 border-t border-[#1F1F1F]">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-2">
              Animation Sequence Mode
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#161616] rounded-[8px] border border-[#1F1F1F]">
              {[
                { id: 'all', label: 'Unified Live' },
                { id: 'core', label: '1-3: Open/Swipe' },
                { id: 'scroll', label: '4: Scroll -543' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id as any)}
                  className={`py-1.5 text-center text-[10px] font-semibold rounded-[6px] transition-all ${
                    currentMode === m.id
                      ? 'bg-[#FFFFFF] text-[#000000]'
                      : 'text-[#71717A] hover:text-[#FFFFFF]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Source API Switcher */}
          <div className="pt-2 border-t border-[#1F1F1F]">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-2">
              Database API Dataset
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'featured', label: 'Popclub' },
                { id: 'technosport', label: 'Technosport' },
                { id: 'fastandup', label: 'Fast&Up' },
              ].map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => onDatasetChange(ds.id as any)}
                  className={`p-2 rounded-[8px] text-center text-[10px] font-semibold transition-all border ${
                    activeDataset === ds.id
                      ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#000000]'
                      : 'bg-[#161616] border-[#1F1F1F] text-[#A1A1AA] hover:text-[#FFFFFF]'
                  }`}
                >
                  {ds.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spring Physics Controls */}
          <div className="space-y-3 pt-2 border-t border-[#1F1F1F]">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#A1A1AA] block">
              Spring Physics
            </span>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#71717A]">Stiffness</span>
                <span className="font-mono text-[#FFFFFF] font-semibold">{tuning.springStiffness}</span>
              </div>
              <input
                type="range"
                min="120"
                max="600"
                step="10"
                value={tuning.springStiffness}
                onChange={(e) => onUpdateTuning({ ...tuning, springStiffness: Number(e.target.value), selectedPreset: 'custom' })}
                className="w-full accent-white bg-[#1F1F1F] h-1.5 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#71717A]">Damping</span>
                <span className="font-mono text-[#FFFFFF] font-semibold">{tuning.springDamping}</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={tuning.springDamping}
                onChange={(e) => onUpdateTuning({ ...tuning, springDamping: Number(e.target.value), selectedPreset: 'custom' })}
                className="w-full accent-white bg-[#1F1F1F] h-1.5 rounded-lg"
              />
            </div>
          </div>

          {/* Dismissal Gesture Controls */}
          <div className="space-y-3 pt-2 border-t border-[#1F1F1F]">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#A1A1AA] block">
              Swipe Bottom Threshold
            </span>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#71717A]">Dismiss Distance</span>
                <span className="font-mono text-[#FFFFFF] font-semibold">{tuning.dragCloseThreshold} px</span>
              </div>
              <input
                type="range"
                min="50"
                max="220"
                step="5"
                value={tuning.dragCloseThreshold}
                onChange={(e) => onUpdateTuning({ ...tuning, dragCloseThreshold: Number(e.target.value), selectedPreset: 'custom' })}
                className="w-full accent-white bg-[#1F1F1F] h-1.5 rounded-lg"
              />
            </div>
          </div>

          {/* Real-time Telemetry HUD */}
          <div className="p-3 rounded-[8px] bg-[#161616] border border-[#1F1F1F] space-y-1 font-mono text-[10px]">
            <div className="text-[#A1A1AA] font-semibold mb-1">Telemetry HUD</div>
            <div className="flex justify-between text-[#71717A]">
              <span>Drag Y:</span>
              <span className="text-[#FFFFFF]">{Math.round(realtimeY)} px</span>
            </div>
            <div className="flex justify-between text-[#71717A]">
              <span>Scroll Offset:</span>
              <span className="text-[#FFFFFF]">{Math.round(realtimeScroll)} px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
