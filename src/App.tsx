/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CoreProductAnimation } from './components/CoreProductAnimation';
import { ProductScrollDetailsContent, TuningSidebar } from './components/ScrollExtendedAnimation';
import { PhoneMockup } from './components/PhoneMockup';
import { productApi } from './services/productApi';
import { ProductItem, AnimationTuningConfig, DEFAULT_TUNING_CONFIG } from './types/product';
import { Smartphone, Sparkles, Sliders, RefreshCw } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [recommendations, setRecommendations] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Tuning state
  const [tuning, setTuning] = useState<AnimationTuningConfig>(DEFAULT_TUNING_CONFIG);
  
  // Active product index for the carousel & modal (-1 or null if PLP is visible)
  const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null);
  
  // Dataset selection ('featured' Popclub showcase vs 'technosport' vs 'fastandup')
  const [activeDataset, setActiveDataset] = useState<'featured' | 'technosport' | 'fastandup'>('featured');
  
  // Sequence Mode: 'all' (Unified Live), 'core' (Animations 1, 2, 3), 'scroll' (Animation 4 focus)
  const [currentMode, setCurrentMode] = useState<'all' | 'core' | 'scroll'>('all');
  
  // Desktop phone frame skin toggle
  const [showDeviceFrame, setShowDeviceFrame] = useState<boolean>(true);
  
  // Real-time telemetry tracking
  const [scrollDelta, setScrollDelta] = useState<number>(0);
  const [dragY, setDragY] = useState<number>(0);

  // 1. Initial & dataset-triggered data fetch (API 1: Listing)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    productApi.getProductListing(activeDataset)
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
          // If in 'scroll' focus mode, automatically open the first product
          if (currentMode === 'scroll' && data.length > 0) {
            setActiveProductIndex(0);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeDataset, currentMode]);

  // 2. Fetch recommendations whenever active product changes (API 3: See more products)
  useEffect(() => {
    if (activeProductIndex !== null && activeProductIndex >= 0 && products[activeProductIndex]) {
      const activeProd = products[activeProductIndex];
      productApi.getSeeMoreProducts(activeProd.brand_info.name, activeProd.id)
        .then((recs) => {
          setRecommendations(recs);
        });
    }
  }, [activeProductIndex, products]);

  const handleProductSelect = (product: ProductItem | null) => {
    if (product) {
      const idx = products.findIndex(p => p.id === product.id);
      setActiveProductIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveProductIndex(null);
    }
  };

  const handleSelectRecommendation = (rec: ProductItem) => {
    // Check if the recommendation exists in products or prepend it
    const existingIdx = products.findIndex(p => p.id === rec.id);
    if (existingIdx >= 0) {
      setActiveProductIndex(existingIdx);
    } else {
      setProducts(prev => [rec, ...prev]);
      setActiveProductIndex(0);
    }
  };

  const handleResetTuning = () => {
    setTuning(DEFAULT_TUNING_CONFIG);
  };

  return (
    <div className="flex h-screen w-screen bg-[#000000] text-white overflow-hidden font-sans">
      
      {/* ======================================================== */}
      {/* MAIN STAGE (Center Phone Viewport on Desktop, 100% on Mobile) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Control Bar on Desktop (Hidden on mobile) */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 bg-[#0D0D0D] border-b border-[#262626] z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-[#FFFFFF] flex items-center gap-2">
                <span>Popclub Product Motion Experience</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161616] text-[#A1A1AA] border border-[#262626]">
                  PopTheme
                </span>
              </h1>
              <p className="text-[11px] text-[#71717A]">
                1. Tap Card (Open) • 2. Swipe Left/Right (Carousel) • 3. Pull Down (Close) • 4. Scroll Up (-543)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Trigger to Open Product */}
            <button
              onClick={() => setActiveProductIndex(activeProductIndex === null ? 0 : null)}
              className="px-3 py-1.5 rounded-[8px] bg-[#161616] hover:bg-[#1C1C1E] border border-[#262626] text-[#FFFFFF] text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>{activeProductIndex === null ? "Open Product PDP" : "Back to PLP"}</span>
            </button>

            {/* Device Frame Skin Toggle */}
            <button
              onClick={() => setShowDeviceFrame(!showDeviceFrame)}
              className="px-3 py-1.5 rounded-[8px] bg-[#161616] hover:bg-[#1C1C1E] text-[#A1A1AA] text-xs font-semibold transition-all border border-[#262626] flex items-center gap-1.5"
            >
              <Smartphone size={14} />
              <span>{showDeviceFrame ? "Phone Frame: ON" : "Phone Frame: OFF"}</span>
            </button>
          </div>
        </header>

        {/* Center Stage Container */}
        <main className="flex-1 w-full h-full flex items-center justify-center p-0 md:p-6 overflow-hidden bg-[#070707]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <span className="text-xs font-medium">Fetching API datasets...</span>
            </div>
          ) : (
            <PhoneMockup showDeviceFrame={showDeviceFrame}>
              <CoreProductAnimation
                products={products}
                tuning={tuning}
                activeProductIndex={activeProductIndex ?? undefined}
                onActiveIndexChange={(idx) => setActiveProductIndex(idx >= 0 ? idx : null)}
                onProductSelect={handleProductSelect}
                onScrollDelta={(delta) => setScrollDelta(delta)}
                renderScrollDetails={(activeProd, isScrolledUp, onExpand) => (
                  <ProductScrollDetailsContent
                    product={activeProd}
                    recommendations={recommendations}
                    scrollY={scrollDelta}
                    isScrolledUp={isScrolledUp}
                    onExpand={onExpand}
                    onSelectRecommendation={handleSelectRecommendation}
                  />
                )}
              />
            </PhoneMockup>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* TUNING PARAMETER SIDEBAR (Hidden automatically on mobile)*/}
      {/* ======================================================== */}
      <TuningSidebar
        tuning={tuning}
        onUpdateTuning={setTuning}
        onResetTuning={handleResetTuning}
        activeDataset={activeDataset}
        onDatasetChange={setActiveDataset}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        realtimeY={dragY}
        realtimeScroll={scrollDelta}
      />
    </div>
  );
}
