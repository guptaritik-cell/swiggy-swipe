/**
 * @file CoreProductAnimation.tsx
 * 
 * Implements:
 * 1. Product Listing Page (PLP):
 *    - Search, Wishlist, POPcoin badge in header
 *    - Filter chips with rounded-[8px]
 *    - Exact POPchop promo banner
 *    - 2-column product grid with 1:1 square ratio images
 *    - Bottom offer bar with POPcoin & POPchop icons
 * 
 * 2. Shared-Element Product Page (PDP):
 *    - Expanding open: Card morphs directly from the grid slot into full screen (layoutId)
 *    - Pull-down closing: When at top (scrollTop <= 2), dragging down moves the card
 *      down a little bit (elastic dragY + corner rounding), then smoothly collapses back
 *      into the small card in the PLP grid.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Heart,
  Search,
  ChevronDown,
  ShoppingCart,
  ChevronRight,
  Share,
  Star,
  Check,
} from 'lucide-react';
import { ProductItem, AnimationTuningConfig } from '../types/product';
import { APP_ASSETS } from '../data/productsData';

interface CoreProductAnimationProps {
  products: ProductItem[];
  tuning: AnimationTuningConfig;
  onProductSelect?: (product: ProductItem | null) => void;
  activeProductIndex?: number | null;
  onActiveIndexChange?: (index: number) => void;
  renderScrollDetails?: (product: ProductItem, isScrolledUp: boolean, onExpand?: () => void) => React.ReactNode;
  onScrollDelta?: (scrollTop: number) => void;
  replayTrigger?: number;
}

export const CoreProductAnimation: React.FC<CoreProductAnimationProps> = ({
  products,
  tuning,
  onProductSelect,
  activeProductIndex: externalIndex,
  onActiveIndexChange,
  renderScrollDetails,
  onScrollDelta,
  replayTrigger,
}) => {
  const [internalIndex, setInternalIndex] = useState<number | null>(null);
  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;

  // Gap between product cards during horizontal sliding (10-15px)
  const PRODUCT_SLIDE_GAP = 14;

  // Selected size per product
  const [selectedSizes, setSelectedSizes] = useState<Record<string | number, string>>({});

  // Selected gallery image index per product
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string | number, number>>({});

  // Real-time horizontal slide offset for hero gallery images (in px) and dragging state
  const [imageDragX, setImageDragX] = useState<number>(0);
  const [isImageDragging, setIsImageDragging] = useState<boolean>(false);

  // Real-time horizontal slide offset (in px) and dragging state for products
  const [dragX, setDragX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Pull-down drag distance for pull-to-close gesture
  const [dragY, setDragY] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Added to cart feedback state
  const [addedToCartId, setAddedToCartId] = useState<string | number | null>(null);

  // "Slide down to go back" onboarding nudge state
  const [showSwipeDownNudge, setShowSwipeDownNudge] = useState<boolean>(false);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Entrance choreography tracking (true only during card open from PLP or replay)
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [contentAnimKey, setContentAnimKey] = useState<number>(0);
  const [dockEntranceKey, setDockEntranceKey] = useState<number>(0);
  const [entranceStep, setEntranceStep] = useState<number>(0);
  const [isEntrancePhase, setIsEntrancePhase] = useState<boolean>(false);
  const [isCartEntrancePhase, setIsCartEntrancePhase] = useState<boolean>(false);
  const prevIndexRef = useRef<number | null>(null);
  const prevReplayRef = useRef<number | undefined>(replayTrigger);

  const startEntranceChoreography = useCallback(() => {
    setAnimationKey(prev => prev + 1);
    setContentAnimKey(prev => prev + 1);
    setDockEntranceKey(prev => prev + 1);
    setEntranceStep(0);
    setIsEntrancePhase(true);
    setIsCartEntrancePhase(true);
    const stepTimer = setTimeout(() => {
      setEntranceStep(1);
    }, 40);

    const finishTimer = setTimeout(() => {
      setIsEntrancePhase(false);
      setIsCartEntrancePhase(false);
    }, 1200);

    return () => {
      clearTimeout(stepTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  // Live re-trigger entrance animation when tuning parameters are adjusted in the sidebar
  const prevTuningRef = useRef(tuning);
  useEffect(() => {
    if (activeIndex !== null && activeIndex >= 0) {
      if (
        prevTuningRef.current.addToCartStartY !== tuning.addToCartStartY ||
        prevTuningRef.current.addToCartDuration !== tuning.addToCartDuration ||
        prevTuningRef.current.addToCartDelay !== tuning.addToCartDelay ||
        prevTuningRef.current.addToCartStartOpacity !== tuning.addToCartStartOpacity ||
        prevTuningRef.current.addToCartEndOpacity !== tuning.addToCartEndOpacity ||
        prevTuningRef.current.contentSlideDistance !== tuning.contentSlideDistance ||
        prevTuningRef.current.contentDuration !== tuning.contentDuration ||
        prevTuningRef.current.contentDelay !== tuning.contentDelay ||
        prevTuningRef.current.contentStartOpacity !== tuning.contentStartOpacity
      ) {
        prevTuningRef.current = tuning;
        const timer = setTimeout(() => {
          startEntranceChoreography();
        }, 120);
        return () => clearTimeout(timer);
      }
    }
    prevTuningRef.current = tuning;
  }, [tuning, activeIndex, startEntranceChoreography]);

  useEffect(() => {
    const wasClosed = prevIndexRef.current === null || prevIndexRef.current === -1;
    const isNowOpen = activeIndex !== null && activeIndex >= 0;
    prevIndexRef.current = activeIndex;

    const replayChanged = replayTrigger !== undefined && replayTrigger !== prevReplayRef.current;
    prevReplayRef.current = replayTrigger;

    if (wasClosed && isNowOpen) {
      // Trigger smooth "Swipe down to go back" nudge ONLY on click from PLP
      setShowSwipeDownNudge(false);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      if (nudgeHideTimerRef.current) clearTimeout(nudgeHideTimerRef.current);

      nudgeTimerRef.current = setTimeout(() => {
        setShowSwipeDownNudge(true);
        nudgeHideTimerRef.current = setTimeout(() => {
          setShowSwipeDownNudge(false);
        }, 2000);
      }, 700);

      return startEntranceChoreography();
    } else if (isNowOpen && replayChanged) {
      return startEntranceChoreography();
    } else if (!isNowOpen) {
      setEntranceStep(0);
      setIsEntrancePhase(false);
      setIsCartEntrancePhase(false);
      setShowSwipeDownNudge(false);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      if (nudgeHideTimerRef.current) clearTimeout(nudgeHideTimerRef.current);
    } else {
      // Swiping between products while already open - do NOT trigger nudge or top-to-bottom cart drop
      setShowSwipeDownNudge(false);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      if (nudgeHideTimerRef.current) clearTimeout(nudgeHideTimerRef.current);
      // But DO trigger content entrance animation for the newly selected product
      setContentAnimKey(prev => prev + 1);
      setIsCartEntrancePhase(false);
    }
  }, [
    activeIndex,
    replayTrigger,
    startEntranceChoreography,
  ]);

  // Track scroll position per product slide
  const [scrollTops, setScrollTops] = useState<Record<number, number>>({});
  const slideScrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Record<string | number, boolean>>({});

  // Filter chips in PLP
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const dockContainerRef = useRef<HTMLDivElement | null>(null);

  // Track container width for precise full-bleed slide tracking
  const [containerWidth, setContainerWidth] = useState<number>(380);
  const [dockWidth, setDockWidth] = useState<number>(360);

  useEffect(() => {
    const updateDimensions = () => {
      if (sliderContainerRef.current) {
        const sw = sliderContainerRef.current.clientWidth;
        if (sw > 0) setContainerWidth(sw);
      }
      if (dockContainerRef.current) {
        const dw = dockContainerRef.current.clientWidth;
        if (dw > 0) setDockWidth(dw);
      }
    };
    updateDimensions();

    const ro = new ResizeObserver(updateDimensions);
    if (sliderContainerRef.current) ro.observe(sliderContainerRef.current);
    if (dockContainerRef.current) ro.observe(dockContainerRef.current);
    window.addEventListener('resize', updateDimensions);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [activeIndex]);

  const safeIndex = activeIndex !== null && activeIndex >= 0 && activeIndex < products.length ? activeIndex : 0;
  const currentProduct = activeIndex !== null && activeIndex >= 0 ? products[safeIndex] : null;

  // Dimensions for hero gallery carousel with peek effect
  const HERO_PADDING_LEFT = 16;
  const HERO_CARD_GAP = 12;
  const HERO_PEEK_WIDTH = 36;
  const heroCardWidth = Math.max(260, containerWidth - HERO_PADDING_LEFT - HERO_CARD_GAP - HERO_PEEK_WIDTH);
  const heroCardHeight = Math.round(heroCardWidth * 1.12);

  const getProductGallery = useCallback((prod: ProductItem): string[] => {
    if (prod.galleryImages && prod.galleryImages.length > 0) {
      return prod.galleryImages;
    }
    return [prod.images, APP_ASSETS.productImage2];
  }, []);

  const currentScrollTop = scrollTops[safeIndex] || 0;
  const isScrolled = currentScrollTop > 15;
  const nudgeShiftY = (showSwipeDownNudge && !isScrolled) ? 8 : 0;

  const handleOpenProduct = useCallback((index: number, isFromPLP: boolean = false) => {
    setIsClosing(false);
    setDragY(0);
    setDragX(0);
    setImageDragX(0);
    setIsDragging(false);
    setIsImageDragging(false);
    setIsPulling(false);
    if (isFromPLP) {
      setIsEntrancePhase(true);
      setIsCartEntrancePhase(true);
      setAnimationKey(prev => prev + 1);
      setContentAnimKey(prev => prev + 1);
      setDockEntranceKey(prev => prev + 1);
    } else {
      setIsEntrancePhase(false);
      setIsCartEntrancePhase(false);
      setContentAnimKey(prev => prev + 1);
    }
    if (onActiveIndexChange) {
      onActiveIndexChange(index);
    } else {
      setInternalIndex(index);
    }
    if (products[index]) {
      onProductSelect?.(products[index]);
    }
  }, [onActiveIndexChange, onProductSelect, products]);

  // Navigate to next product
  const handleNextProduct = useCallback(() => {
    if (!products || products.length === 0) return;
    const curr = activeIndex ?? 0;
    if (curr < products.length - 1) {
      handleOpenProduct(curr + 1);
    } else {
      handleOpenProduct(0);
    }
  }, [products, activeIndex, handleOpenProduct]);

  // Navigate to previous product
  const handlePrevProduct = useCallback(() => {
    if (!products || products.length === 0) return;
    const curr = activeIndex ?? 0;
    if (curr > 0) {
      handleOpenProduct(curr - 1);
    } else {
      handleOpenProduct(products.length - 1);
    }
  }, [products, activeIndex, handleOpenProduct]);

  // Reset positions when switching active product
  useEffect(() => {
    setDragY(0);
    setDragX(0);
    setImageDragX(0);
    setIsDragging(false);
    setIsImageDragging(false);
    setIsPulling(false);
    slideScrollRefs.current.forEach((el) => {
      if (el) el.scrollLeft = 0;
    });
  }, [activeIndex]);

  const toggleWishlist = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (product: ProductItem) => {
    setAddedToCartId(product.id);
    setTimeout(() => {
      setAddedToCartId(null);
    }, 1800);
  };

  // Smoothly trigger collapse back into small card in PLP with ease out curve
  const handleCloseProduct = useCallback(() => {
    setIsClosing(true);
    setIsDragging(false);
    setIsImageDragging(false);
    setIsPulling(false);

    if (onActiveIndexChange) {
      onActiveIndexChange(-1);
    } else {
      setInternalIndex(null);
    }
    onProductSelect?.(null);

    const closeDurationMs = (tuning.closeDuration ?? 0.42) * 1000;
    setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      setDragX(0);
      setImageDragX(0);
    }, closeDurationMs + 50);
  }, [onActiveIndexChange, onProductSelect, tuning.closeDuration]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentProduct) return;
      if (e.key === 'Escape') {
        handleCloseProduct();
      } else if (e.key === 'ArrowRight') {
        handleNextProduct();
      } else if (e.key === 'ArrowLeft') {
        handlePrevProduct();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProduct, handleNextProduct, handlePrevProduct, handleCloseProduct]);

  // Scroll listener per slide
  const handleSlideScroll = (e: React.UIEvent<HTMLDivElement>, idx: number) => {
    if (e.currentTarget.scrollLeft !== 0) {
      e.currentTarget.scrollLeft = 0;
    }
    const st = e.currentTarget.scrollTop;
    setScrollTops(prev => ({ ...prev, [idx]: st }));
    if (idx === safeIndex) {
      onScrollDelta?.(st);
    }
  };

  // ========================================================
  // Unified Ultra-Smooth Pointer Gestures:
  // - Image swipe: Swiping on product hero image slides gallery images of the SAME product
  // - Product swipe: Swiping anywhere other than the image slides to the NEXT/PREV product
  // - Pull-to-close: dragging down at top smoothly collapses card back to PLP
  // ========================================================
  const pointerStartXRef = useRef<number>(0);
  const pointerStartYRef = useRef<number>(0);
  const pointerStartTimeRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const gestureTypeRef = useRef<'horizontal_image' | 'horizontal_product' | 'pull_down' | 'vertical' | null>(null);
  const pointerTargetRef = useRef<'image' | 'product' | null>(null);

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('.bottom-dock-container')) return;

    const isOverImage = !!(e.target as HTMLElement).closest('.product-hero-carousel');
    pointerTargetRef.current = isOverImage ? 'image' : 'product';

    pointerStartXRef.current = e.clientX;
    pointerStartYRef.current = e.clientY;
    pointerStartTimeRef.current = performance.now();
    isPointerDownRef.current = true;
    gestureTypeRef.current = null;
  };

  const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - pointerStartXRef.current;
    const dy = e.clientY - pointerStartYRef.current;
    const activeSt = scrollTops[safeIndex] || 0;

    if (!gestureTypeRef.current) {
      if (Math.hypot(dx, dy) > 7) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (pointerTargetRef.current === 'image') {
            gestureTypeRef.current = 'horizontal_image';
            setIsImageDragging(true);
          } else {
            gestureTypeRef.current = 'horizontal_product';
            setIsDragging(true);
          }
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
        } else if (dy > 8 && dy > Math.abs(dx) * 1.2 && activeSt <= 2) {
          gestureTypeRef.current = 'pull_down';
          setIsPulling(true);
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
        } else {
          gestureTypeRef.current = 'vertical';
        }
      }
    }

    if (gestureTypeRef.current === 'horizontal_image') {
      const gallery = currentProduct ? getProductGallery(currentProduct) : [];
      const currentImgIdx = currentProduct ? (activeImageIndices[currentProduct.id] || 0) : 0;
      let effectiveDx = dx;
      if ((currentImgIdx === 0 && dx > 0) || (currentImgIdx >= gallery.length - 1 && dx < 0)) {
        effectiveDx = dx * 0.32;
      }
      setImageDragX(effectiveDx);
    } else if (gestureTypeRef.current === 'horizontal_product') {
      let effectiveDx = dx;
      if ((safeIndex === 0 && dx > 0) || (safeIndex === products.length - 1 && dx < 0)) {
        effectiveDx = dx * 0.32;
      }
      setDragX(effectiveDx);
    } else if (gestureTypeRef.current === 'pull_down') {
      const threshold = tuning.dragCloseThreshold || 80;
      const dampedY = dy <= threshold ? dy : threshold + Math.pow(dy - threshold, 0.85);
      setDragY(dampedY);
    }
  };

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const totalDx = e.clientX - pointerStartXRef.current;
    const totalDy = e.clientY - pointerStartYRef.current;
    const dt = Math.max(1, performance.now() - pointerStartTimeRef.current);
    const vx = totalDx / dt;

    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (gestureTypeRef.current === 'horizontal_image') {
      setIsImageDragging(false);
      const threshold = Math.min(heroCardWidth * 0.15, 40);

      const gallery = currentProduct ? getProductGallery(currentProduct) : [];
      const currentImgIdx = currentProduct ? (activeImageIndices[currentProduct.id] || 0) : 0;

      let targetImg = currentImgIdx;
      if ((totalDx < -threshold || vx < -0.25) && currentImgIdx < gallery.length - 1) {
        targetImg = currentImgIdx + 1;
      } else if ((totalDx > threshold || vx > 0.25) && currentImgIdx > 0) {
        targetImg = currentImgIdx - 1;
      }

      setImageDragX(0);
      if (currentProduct && targetImg !== currentImgIdx) {
        setActiveImageIndices(prev => ({ ...prev, [currentProduct.id]: targetImg }));
      }
    } else if (gestureTypeRef.current === 'horizontal_product') {
      setIsDragging(false);
      const threshold = Math.min(containerWidth * 0.18, 48);

      let target = safeIndex;
      if ((totalDx < -threshold || vx < -0.28) && safeIndex < products.length - 1) {
        target = safeIndex + 1;
      } else if ((totalDx > threshold || vx > 0.28) && safeIndex > 0) {
        target = safeIndex - 1;
      }

      setDragX(0);
      if (target !== safeIndex) {
        handleOpenProduct(target);
      }
    } else if (gestureTypeRef.current === 'pull_down') {
      setIsPulling(false);
      const threshold = tuning.dragCloseThreshold || 80;
      if (totalDy >= threshold || dragY >= threshold) {
        handleCloseProduct();
      } else {
        setDragY(0);
      }
    }
    gestureTypeRef.current = null;
    pointerTargetRef.current = null;
  };

  // Trackpad / mouse wheel scroll listener
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const isOverImage = !!(e.target as HTMLElement).closest('.product-hero-carousel');
    const activeSt = scrollTops[safeIndex] || 0;
    if (activeSt <= 2 && e.deltaY < -6) {
      setDragY(prev => Math.min(50, prev + Math.abs(e.deltaY) * 0.45));
      setIsPulling(true);

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        handleCloseProduct();
      }, 90);
    } else if (Math.abs(e.deltaX) > 28) {
      if (wheelTimeoutRef.current) return;
      if (isOverImage && currentProduct) {
        const gallery = getProductGallery(currentProduct);
        const currentImgIdx = activeImageIndices[currentProduct.id] || 0;
        if (e.deltaX > 0 && currentImgIdx < gallery.length - 1) {
          setActiveImageIndices(prev => ({ ...prev, [currentProduct.id]: currentImgIdx + 1 }));
        } else if (e.deltaX < 0 && currentImgIdx > 0) {
          setActiveImageIndices(prev => ({ ...prev, [currentProduct.id]: currentImgIdx - 1 }));
        }
      } else {
        if (e.deltaX > 0 && safeIndex < products.length - 1) {
          handleNextProduct();
        } else if (e.deltaX < 0 && safeIndex > 0) {
          handlePrevProduct();
        }
      }
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 350);
    }
  };

  // Dimensions for bottom dock centering math
  const DOCK_ITEM_WIDTH = 44;
  const DOCK_ITEM_GAP = 12;
  const DOCK_ITEM_STEP = DOCK_ITEM_WIDTH + DOCK_ITEM_GAP;
  const targetDockX = dockWidth / 2 - (safeIndex * DOCK_ITEM_STEP + DOCK_ITEM_WIDTH / 2);

  // Bottom dock pointer drag handlers
  const dockPointerStartXRef = useRef<number>(0);
  const dockIsDraggingRef = useRef<boolean>(false);
  const [dockDragOffset, setDockDragOffset] = useState<number>(0);

  const handleDockPointerDown = (e: React.PointerEvent) => {
    dockPointerStartXRef.current = e.clientX;
    dockIsDraggingRef.current = true;
  };

  const handleDockPointerMove = (e: React.PointerEvent) => {
    if (!dockIsDraggingRef.current) return;
    const dx = e.clientX - dockPointerStartXRef.current;
    if (Math.abs(dx) > 4) {
      setDockDragOffset(dx);
    }
  };

  const handleDockPointerUp = (e: React.PointerEvent) => {
    if (!dockIsDraggingRef.current) return;
    dockIsDraggingRef.current = false;
    const dx = e.clientX - dockPointerStartXRef.current;

    if (Math.abs(dx) > 14) {
      const currentTrackX = targetDockX + dx;
      const centerOffset = dockWidth / 2 - DOCK_ITEM_WIDTH / 2;
      const nearestIndex = Math.round((centerOffset - currentTrackX) / DOCK_ITEM_STEP);
      const clampedIndex = Math.max(0, Math.min(products.length - 1, nearestIndex));
      handleOpenProduct(clampedIndex);
    }

    setDockDragOffset(0);
  };

  const handleDockWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 15) {
      if (delta > 0) {
        handleNextProduct();
      } else {
        handlePrevProduct();
      }
    }
  };

  // High-smoothness spring physics with reduced bounce
  const smoothSpringTransition = {
    type: 'spring' as const,
    stiffness: tuning.springStiffness || 320,
    damping: Math.max(tuning.springDamping || 36, 34),
    mass: 0.8,
  };

  return (
    <div className="relative w-full h-full bg-[#0D0D0D] text-[#FFFFFF] overflow-hidden select-none flex flex-col font-sans">
      
      {/* ======================================================== */}
      {/* PLP TOP APP BAR                                          */}
      {/* ======================================================== */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-3 h-12 bg-[#0D0D0D] border-b border-[#262626]">
        <div className="flex items-center">
          <button
            onClick={() => currentProduct ? handleCloseProduct() : null}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ChevronLeft size={22} className="text-[#FFFFFF]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-[#FFFFFF]" aria-label="Search">
            <Search size={19} className="text-[#FFFFFF]" />
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center text-[#FFFFFF]" aria-label="Wishlist">
            <Heart size={19} className="text-[#FFFFFF]" />
          </button>

          <div className="flex items-center gap-1 px-2 py-0.5 border border-white/15 rounded-full bg-transparent">
            <img
              src={APP_ASSETS.popCoin}
              alt="POPcoin"
              className="w-3.5 h-3.5 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-xs font-semibold text-[#FFFFFF]">43K</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PLP PRODUCT LISTING VIEW                                 */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#0D0D0D]">
        <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
          {['Status', 'Month', 'Category', 'Amount'].map((f, i) => (
            <button
              key={f + i}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all border ${
                activeFilter === f
                  ? 'bg-[#1C1C1E] border-[#262626] text-[#FFFFFF]'
                  : 'bg-[#161616] border-[#1F1F1F] text-[#A1A1AA] hover:text-[#FFFFFF]'
              }`}
            >
              <span>{f}</span>
              <ChevronDown size={13} className="text-[#71717A]" />
            </button>
          ))}
        </div>

        {/* POPchop Banner on PLP */}
        <div className="px-3 mb-3 cursor-pointer active:scale-[0.99] transition-transform">
          <div className="rounded-[14px] overflow-hidden bg-[#161616]">
            <img
              src={APP_ASSETS.popChopBanner}
              alt="POPchop Banner"
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>

        {/* 2-Column Product Grid (Cards with shared layoutId for small-to-big expansion) */}
        <div className="grid grid-cols-2 gap-2.5 px-3">
          {products.map((product, idx) => {
            const isLiked = wishlist[product.id] || false;
            const hasPopchopEmi = (product.offer_price_detail?.bnpl_offer?.emi_amount || 0) > 0;
            const emiAmt = product.offer_price_detail?.bnpl_offer?.emi_amount || Math.round(product.price.selling_price / 3);
            const popCoins = product.popstar_coins || 234;
            const isSelectedOpen = currentProduct && currentProduct.id === product.id && !isClosing;

            return (
              <motion.div
                key={`grid-item-${product.id}`}
                layoutId={`product-card-${product.id}`}
                transition={
                  isClosing
                    ? {
                        duration: tuning.closeDuration ?? 0.42,
                        ease: [0.16, 1, 0.3, 1],
                      }
                    : smoothSpringTransition
                }
                onClick={() => handleOpenProduct(idx, true)}
                style={{
                  opacity: isSelectedOpen ? 0 : 1,
                  pointerEvents: currentProduct ? 'none' : 'auto',
                }}
                className="group relative flex flex-col bg-[#161616] rounded-[12px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-150"
              >
                {/* 1:1 Square Image */}
                <div className="relative w-full aspect-square bg-[#1C1C1E] overflow-hidden rounded-[12px]">
                  <img
                    src={product.images}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = APP_ASSETS.productImage2;
                    }}
                  />

                  {/* Rating badge */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] bg-[rgba(0,0,0,0.55)] text-[10px] font-semibold text-[#FFFFFF] backdrop-blur-xs">
                    <Star size={11} className="text-[#FFFFFF]" fill="none" strokeWidth={1.8} />
                    <span>{product.ratings_info?.average_rating || 4.5}</span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[rgba(0,0,0,0.40)] flex items-center justify-center text-[#FFFFFF] active:scale-90 transition-transform"
                    aria-label="Save to wishlist"
                  >
                    <Heart size={14} className={isLiked ? "fill-red-500 text-red-500" : "text-[#FFFFFF]"} />
                  </button>
                </div>

                {/* Brand & Title Info */}
                <div className="pt-2 px-2 pb-1 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-[#71717A] truncate block">
                      {product.brand_info.name}
                    </span>
                    <h3 className="text-xs font-semibold text-[#FFFFFF] line-clamp-1 leading-snug mt-0.5">
                      {product.title}
                    </h3>
                  </div>

                  {/* Price Section */}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#FFFFFF]">
                      ₹{product.price.selling_price}
                    </span>
                    {product.price.mrp > product.price.selling_price && (
                      <span className="text-xs font-semibold text-[#71717A] line-through">
                        ₹{product.price.mrp}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Offer Bar */}
                <div
                  className="w-full h-8 px-2 flex items-center justify-between rounded-b-[12px]"
                  style={{
                    background: hasPopchopEmi
                      ? 'linear-gradient(90deg, #2D0B5A 0%, #4D1282 50%, #250842 100%)'
                      : 'linear-gradient(90deg, #0554DA 0%, #0062FF 100%)'
                  }}
                >
                  <div className="flex items-center text-xs font-semibold text-[#FFFFFF]">
                    <span>₹{emiAmt}</span>
                    <span className="text-[11px] text-[#A1A1AA] ml-0.5">x3mo</span>
                    <span className="mx-1 text-[#FFFFFF]">+</span>
                    <img src={APP_ASSETS.popCoin} alt="" className="w-[18px] h-[18px] object-contain inline mr-0.5" />
                    <span>{popCoins}</span>
                  </div>

                  <img src={APP_ASSETS.popChopIcon} alt="" className="w-[18px] h-[18px] object-contain opacity-90" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* INDIVIDUAL PRODUCT PAGE OVERLAY (PDP)                    */}
      {/* Shared-element expansion from small card to full screen  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {currentProduct && activeIndex !== null && (
          <motion.div
            key="pdp-modal-overlay"
            layoutId={`product-card-${currentProduct.id}`}
            transition={
              isClosing
                ? {
                    duration: tuning.closeDuration ?? 0.42,
                    ease: [0.16, 1, 0.3, 1],
                  }
                : smoothSpringTransition
            }
            animate={{
              y: isClosing ? 0 : dragY,
              scale: isClosing ? 1 : 1 - Math.min(dragY / 1500, 0.05),
              borderRadius: isClosing ? 12 : Math.min(24, Math.max(0, dragY * 0.2)),
            }}
            className={`absolute inset-0 z-50 flex flex-col bg-[#0D0D0D] overflow-hidden ${
              tuning.enableBackdropBlur ? 'backdrop-blur-xl' : ''
            }`}
          >
            {/* Slide Down Nudge with generous top and bottom margin */}
            <AnimatePresence>
              {showSwipeDownNudge && !isScrolled && (
                <motion.div
                  key="slide-down-nudge"
                  initial={{ y: -24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 340,
                    damping: 34,
                  }}
                  className="absolute top-2 left-0 right-0 z-50 pointer-events-none flex items-center justify-center gap-1.5 py-0.5 select-none"
                >
                  <ChevronDown size={14} className="text-zinc-400 shrink-0" strokeWidth={2.2} />
                  <span className="text-[12px] font-normal tracking-tight text-zinc-400">
                    Swipe down to go back
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FLOATING TOP BAR */}
            <motion.div
              initial={false}
              animate={{
                backgroundColor: isScrolled ? '#0D0D0D' : 'rgba(13,13,13,0)',
                borderBottomColor: isScrolled ? '#1F1F1F' : 'rgba(31,31,31,0)',
                height: isScrolled ? 48 : 58,
                y: nudgeShiftY,
                opacity: isClosing ? 0 : 1,
              }}
              transition={{
                backgroundColor: { duration: 0.28, ease: 'easeOut' },
                borderBottomColor: { duration: 0.28, ease: 'easeOut' },
                height: { duration: 0.28, ease: 'linear' },
                y: { duration: 0.2, ease: 'linear' },
                opacity: { duration: 0.28, ease: 'easeOut' },
              }}
              className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-3.5 border-b pointer-events-none"
              style={{
                pointerEvents: isScrolled ? 'auto' : 'none',
              }}
            >
              {/* Left slot: Back arrow */}
              <motion.button
                initial={false}
                animate={{
                  opacity: isScrolled ? 1 : 0,
                  x: isScrolled ? 0 : -8,
                  pointerEvents: isScrolled ? 'auto' : 'none',
                }}
                transition={{
                  opacity: { duration: 0.24, ease: 'easeOut' },
                  x: { duration: 0.24, ease: 'easeOut' },
                }}
                onClick={() => {
                  if (currentScrollTop > 20 && slideScrollRefs.current[safeIndex]) {
                    slideScrollRefs.current[safeIndex]?.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    });
                  } else {
                    handleCloseProduct();
                  }
                }}
                className="w-8 h-8 flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform shrink-0 pointer-events-auto"
                aria-label="Back"
              >
                <ChevronLeft size={24} className="text-[#FFFFFF]" />
              </motion.button>

              {/* Center to Top-Right: Cart + POPcoin Badge */}
              <motion.div
                layout
                transition={{
                  layout: { duration: 0.28, ease: 'linear' },
                }}
                className={`flex items-center gap-2 pointer-events-auto ${
                  isScrolled ? 'ml-auto mt-0' : 'mx-auto mt-10'
                }`}
              >
                <motion.button
                  initial={false}
                  animate={{
                    opacity: isScrolled ? 1 : 0,
                    width: isScrolled ? 32 : 0,
                    pointerEvents: isScrolled ? 'auto' : 'none',
                  }}
                  transition={{
                    opacity: { duration: 0.24, ease: 'easeOut' },
                    width: { duration: 0.24, ease: 'easeOut' },
                  }}
                  className="overflow-hidden h-8 flex items-center justify-center text-white"
                  aria-label="Search"
                >
                  <Search size={20} className="text-white" />
                </motion.button>

                <motion.button
                  initial={false}
                  animate={{
                    backgroundColor: isScrolled ? 'rgba(0,0,0,0)' : '#1C1C1E',
                    borderColor: isScrolled ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.1)',
                    boxShadow: isScrolled ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.2)',
                  }}
                  transition={{
                    duration: 0.24,
                    ease: 'easeOut',
                  }}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform shrink-0"
                  aria-label="Cart"
                >
                  <ShoppingCart size={isScrolled ? 16 : 16} className="text-[#FFFFFF]" />
                </motion.button>

                {/* POP Box matching exactly the cart icon box height (h-8 = 32px) */}
                <div className="h-7 flex items-center gap-1 px-2 border border-white/15 rounded-full bg-[#1C1C1E] backdrop-blur-md shadow-md shrink-0">
                  <img src={APP_ASSETS.popCoin} alt="" className="w-4.5 h-4.5 object-contain" />
                  <span className="text-sm font-semibold text-[#FFFFFF] leading-none">43K</span>
                </div>
              </motion.div>

              <motion.div
                initial={false}
                animate={{ width: isScrolled ? 0 : 32 }}
                transition={{ duration: 0.28, ease: 'linear' }}
                className="shrink-0 pointer-events-none overflow-hidden"
              />
            </motion.div>

            {/* MAIN PDP HORIZONTAL PRODUCT SLIDER & VERTICAL SCROLL BODY */}
            <motion.div
              animate={{
                y: nudgeShiftY,
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="flex-1 flex flex-col overflow-hidden relative bg-[#0D0D0D]"
            >
              {/* Added to cart toast notification */}
              <AnimatePresence>
                {addedToCartId && (
                  <motion.div
                    initial={{ y: -20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -16, opacity: 0, scale: 0.95 }}
                    className="absolute top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 shadow-xl backdrop-blur-md pointer-events-none"
                  >
                    <Check size={14} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                    <span className="text-xs font-semibold text-emerald-200">Added to cart</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PULL INDICATOR BAR (Visible when card goes down) */}
              {dragY > 10 && (
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/40 z-50 pointer-events-none" />
              )}

              {/* HORIZONTAL MULTI-PRODUCT SLIDER CONTAINER */}
              <div
                ref={sliderContainerRef}
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
                onPointerCancel={handleSliderPointerUp}
                onWheel={handleWheel}
                className="flex-1 w-full overflow-hidden relative flex flex-col"
                style={{ touchAction: 'pan-y' }}
              >
                {/* HORIZONTAL PRODUCT SLIDER TRACK WITH 10-15px GAP */}
                <motion.div
                  className="flex h-full flex-1"
                  style={{ gap: `${PRODUCT_SLIDE_GAP}px` }}
                  animate={{
                    x: -safeIndex * (containerWidth + PRODUCT_SLIDE_GAP) + dragX,
                  }}
                  transition={
                    isDragging
                      ? { type: 'tween', duration: 0 }
                      : smoothSpringTransition
                  }
                >
                  {products.map((product, idx) => {
                    const isLiked = wishlist[product.id] || false;
                    const productSizes = product.sizes && product.sizes.length > 0
                      ? product.sizes.map((s, sIdx) => ({
                          id: String(s.id || sIdx),
                          label: s.size,
                          isAvailable: s.is_active,
                          stockLeft: s.stockLeft,
                          stockColor: '#D3970D',
                        }))
                      : [
                          { id: 'xs', label: 'XS', isAvailable: true },
                          { id: 's', label: 'S', isAvailable: false },
                          { id: 'm', label: 'M', isAvailable: true, stockLeft: 5, stockColor: '#D3970D' },
                          { id: 'l', label: 'L', isAvailable: true, stockLeft: 10, stockColor: '#D3970D' },
                          { id: 'xl', label: 'XL', isAvailable: false },
                          { id: 'xxl', label: 'XXL', isAvailable: true },
                        ];
                    const selectedSizeId = selectedSizes[product.id] || (productSizes.find(s => s.isAvailable)?.id ?? 'm');
                    const gallery = getProductGallery(product);
                    const activeImageIdx = activeImageIndices[product.id] || 0;
                    const slideScroll = scrollTops[idx] || 0;
                    const isSlideScrolled = slideScroll > 15;
                    const cardInnerWidth = containerWidth - 16;
                    const currentHeroCardWidth = Math.max(240, cardInnerWidth - HERO_PADDING_LEFT - HERO_CARD_GAP - HERO_PEEK_WIDTH);
                    const currentHeroCardHeight = Math.round(currentHeroCardWidth * 1.12);
                    // Rating, heart, sharing icons smoothly shift down from the image on scroll (linear curve shifting)
                    const iconShiftY = Math.min(slideScroll * 0.85, 52);
                    const iconInset0 = Math.max(2,14 - (slideScroll / 40) * 12);
                    const iconInset = Math.max(-52, -34 - (slideScroll / 40) * 12);
                    const isScrolledDown = slideScroll > 60;

                    return (
                      <div
                        key={`product-slide-${product.id}-${idx}`}
                        style={{
                          width: `${containerWidth}px`,
                          padding: isSlideScrolled ? '0px' : '0 8px 6px 8px',
                          transition: 'padding 0.28s linear',
                        }}
                        className="h-full flex flex-col shrink-0 relative select-none"
                      >
                        {/* PRODUCT CARD BODY (Curved border, padding, gradient background) */}
                        <div
                          style={{
                            borderRadius: isSlideScrolled ? '0px' : '26px',
                            background: isSlideScrolled
                              ? '#0D0D0D'
                              : 'linear-gradient(180deg, #0D0D0D 0%, #101013 25%, #141418 60%, #18181D 100%)',
                            transition: 'border-radius 0.28s linear, background 0.28s ease-out',
                          }}
                          className="h-full flex flex-col flex-1 relative overflow-hidden select-none"
                        >
                          {/* VERTICAL SCROLLABLE PRODUCT BODY */}
                          <div
                            ref={(el) => { slideScrollRefs.current[idx] = el; }}
                            onScroll={(e) => handleSlideScroll(e, idx)}
                            className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pt-12 pb-4 overscroll-contain w-full max-w-full"
                            style={{ touchAction: 'pan-y', overflowX: 'clip' }}
                          >
                            {/* PRODUCT HERO IMAGE CAROUSEL WITH ADJACENT PEEK OF SAME PRODUCT */}
                            <div
                              className="product-hero-carousel relative w-full pt-1 pb-1 select-none"
                              style={{ touchAction: 'pan-y', overflowX: 'clip', overflowY: 'visible' }}
                            >
                              {/* TRACK FOR GALLERY IMAGES */}
                              <motion.div
                                className="flex"
                                style={{
                                  paddingLeft: `${HERO_PADDING_LEFT}px`,
                                  gap: `${HERO_CARD_GAP}px`,
                                }}
                                animate={{
                                  x: -activeImageIdx * (currentHeroCardWidth + HERO_CARD_GAP) + (idx === safeIndex ? imageDragX : 0),
                                }}
                                transition={
                                  isImageDragging && idx === safeIndex
                                    ? { type: 'tween', duration: 0 }
                                    : smoothSpringTransition
                                }
                              >
                                {gallery.map((imgUrl, imgIdx) => (
                                  <div
                                    key={`hero-img-${product.id}-${imgIdx}`}
                                    onClick={(e) => {
                                      if (!isImageDragging && imgIdx !== activeImageIdx) {
                                        e.stopPropagation();
                                        setActiveImageIndices(prev => ({ ...prev, [product.id]: imgIdx }));
                                      }
                                    }}
                                    style={{
                                      width: `${currentHeroCardWidth}px`,
                                      height: `${currentHeroCardHeight}px`,
                                    }}
                                    className={`rounded-[28px] overflow-hidden bg-[#161616] border-0 shrink-0 relative shadow-xl ${
                                      imgIdx !== activeImageIdx ? 'cursor-pointer opacity-95' : ''
                                    }`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`${product.title} - ${imgIdx + 1}`}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover object-center pointer-events-none select-none"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = APP_ASSETS.productImage2;
                                      }}
                                    />
                                  </div>
                                ))}
                              </motion.div>

                              {/* ACTION OVERLAY OVER ACTIVE HERO CARD: RATING (BOTTOM-LEFT), HEART & SHARE (BOTTOM-RIGHT) */}
                              <div
                                className="absolute pointer-events-none z-20 flex items-center justify-between"
                                style={{
                                  left: `${HERO_PADDING_LEFT}px`,
                                  top: 4,
                                  width: `${currentHeroCardWidth}px`,
                                  height: `${currentHeroCardHeight}px`,
                                  transform: `translateY(${iconShiftY}px)`,
                                }}
                              >
                                {/* RATING BADGE AT BOTTOM-LEFT */}
                                <div
                                  style={{
                                    left: `${iconInset0}px`,
                                    bottom: '14px',
                                  }}
                                  className={`absolute flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] select-none pointer-events-auto transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
                                    isScrolledDown
                                      ? 'bg-[#161616] border border-[#262626] shadow-md'
                                      : 'bg-black/60 backdrop-blur-md border border-white/10 shadow-md'
                                  }`}
                                >
                                  <Star size={11} className="fill-white text-white" />
                                  <span className="font-semibold text-white text-[12px] leading-none">
                                    {product.ratings_info?.average_rating || 4.5}
                                  </span>
                                </div>

                                {/* HEART & SHARE BUTTONS AT BOTTOM-RIGHT */}
                                <div
                                  style={{
                                    right: `${iconInset}px`,
                                    bottom: '14px',
                                  }}
                                  className="absolute flex items-center gap-2 pointer-events-auto"
                                >
                                  <button
                                    onClick={(e) => toggleWishlist(product.id, e)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-90 transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
                                      isScrolledDown
                                        ? 'bg-transparent border-transparent shadow-none'
                                        : 'bg-black/60 backdrop-blur-md border border-white/10 shadow-md'
                                    }`}
                                    aria-label="Wishlist"
                                  >
                                    <Heart
                                      size={isScrolledDown ? 18 : 18}
                                      className={isLiked ? "fill-red-500 text-red-500" : "text-white"}
                                    />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (navigator.share) {
                                        navigator.share({ title: product.title, url: window.location.href }).catch(() => {});
                                      }
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-90 transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
                                      isScrolledDown
                                        ? 'bg-transparent border-transparent shadow-none'
                                        : 'bg-black/60 backdrop-blur-md border border-white/10 shadow-md'
                                    }`}
                                    aria-label="Share"
                                  >
                                    <Share size={isScrolledDown ? 18 : 18} className="text-white" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* CONTENT BELOW IMAGE (STAGGERED ENTRANCE ANIMATION: BOTTOM -> TOP) */}
                            <div
                              style={{
                                transform: `translateY(${Math.min(slideScroll * 0.75, 46)}px)`,
                              }}
                              className="product-content-body flex flex-col w-full max-w-full"
                            >
                              {/* 1. BRAND & PRODUCT TITLE */}
                              <motion.div
                                key={idx === safeIndex ? `content-title-${product.id}-${contentAnimKey}` : `content-title-${idx}`}
                                initial={
                                  idx === safeIndex
                                    ? {
                                        y: tuning.contentSlideDistance,
                                        opacity: 0,
                                      }
                                    : false
                                }
                                animate={{
                                  y: 0,
                                  opacity: 1,
                                }}
                                transition={
                                  idx === safeIndex
                                    ? {
                                        y: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay,
                                          ease: [0.16, 1, 0.3, 1],
                                        },
                                        opacity: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay,
                                          ease: 'easeOut',
                                        },
                                      }
                                    : { duration: 0 }
                                }
                                className="px-4 pt-2.5 pointer-events-none select-none"
                              >
                                <span className="text-[11px] font-medium text-[#8E8E93] border-b border-dotted border-[#8E8E93] pb-0.5 inline-block">
                                  {product.brand_info.name}
                                </span>
                                <h1 className="text-[15px] font-semibold text-[#FFFFFF] leading-snug mt-1">
                                  {product.title}
                                </h1>
                              </motion.div>

                              {/* 2. PRICING */}
                              <motion.div
                                key={idx === safeIndex ? `content-price-${product.id}-${contentAnimKey}` : `content-price-${idx}`}
                                initial={
                                  idx === safeIndex
                                    ? {
                                        y: tuning.contentSlideDistance,
                                        opacity: 0,
                                      }
                                    : false
                                }
                                animate={{
                                  y: 0,
                                  opacity: 1,
                                }}
                                transition={
                                  idx === safeIndex
                                    ? {
                                        y: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay + 0.08,
                                          ease: [0.16, 1, 0.3, 1],
                                        },
                                        opacity: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay + 0.08,
                                          ease: 'easeOut',
                                        },
                                      }
                                    : { duration: 0 }
                                }
                                className="px-4 pt-1"
                              >
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg font-bold text-[#FFFFFF]">
                                    ₹{product.price.selling_price}
                                  </span>
                                  {product.price.mrp > product.price.selling_price && (
                                    <span className="text-xs font-semibold text-[#71717A] line-through">
                                      ₹{product.price.mrp}
                                    </span>
                                  )}
                                </div>
                              </motion.div>

                              {/* 3. PURPLE BADGE (POPchop Offer Banner) */}
                              <motion.div
                                key={idx === safeIndex ? `content-purple-badge-${product.id}-${contentAnimKey}` : `content-purple-badge-${idx}`}
                                initial={
                                  idx === safeIndex
                                    ? {
                                        y: tuning.contentSlideDistance,
                                        opacity: 0,
                                      }
                                    : false
                                }
                                animate={{
                                  y: 0,
                                  opacity: 1,
                                }}
                                transition={
                                  idx === safeIndex
                                    ? {
                                        y: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay + 0.16,
                                          ease: [0.16, 1, 0.3, 1],
                                        },
                                        opacity: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay + 0.16,
                                          ease: 'easeOut',
                                        },
                                      }
                                    : { duration: 0 }
                                }
                                className="px-4 pt-2.5"
                              >
                                <div
                                  className="rounded-[14px] p-2.5 border border-purple-500/20 relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer pointer-events-auto"
                                  style={{
                                    background: 'linear-gradient(90deg, #2D0558 0%, #4D0084 50%, #2A0452 100%)',
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-full bg-purple-400/20 flex items-center justify-center">
                                        <img src={APP_ASSETS.popChopIcon} alt="" className="w-4 h-4 object-contain" />
                                      </div>
                                      <div>
                                        <span className="text-xs font-bold text-[#FFFFFF] block">Or pay ₹0 now</span>
                                        <div className="flex items-center gap-1 text-[11px] text-white/90 mt-0.5 font-medium">
                                          <span>₹{product.offer_price_detail?.bnpl_offer?.emi_amount || Math.round(product.price.selling_price / 3)}</span>
                                          <span className="text-[10px] text-white/70">x3mo</span>
                                          <span>+</span>
                                          <img src={APP_ASSETS.popCoin} alt="" className="w-3 h-3 object-contain inline" />
                                          <span>{product.popstar_coins || 180}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold italic tracking-wide text-white/80">POPchop</span>
                                      <button className="px-2.5 py-1 rounded-full bg-[#FFFFFF] text-[#000000] text-[11px] font-bold shadow-sm hover:bg-zinc-100 active:scale-95 transition-transform">
                                        Learn more
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>

                              {/* 4. BELOW TEXT (Pay Zero Chip, Size Selector, Details) */}
                              <motion.div
                                key={idx === safeIndex ? `content-below-text-${product.id}-${contentAnimKey}` : `content-below-text-${idx}`}
                                initial={
                                  idx === safeIndex
                                    ? {
                                        y: tuning.contentSlideDistance,
                                        opacity: 0,
                                      }
                                    : false
                                }
                                animate={{
                                  y: 0,
                                  opacity: 1,
                                }}
                                transition={
                                  idx === safeIndex
                                    ? {
                                        y: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay + 0.24,
                                          ease: [0.16, 1, 0.3, 1],
                                        },
                                        opacity: {
                                          duration: tuning.contentDuration,
                                          delay: tuning.contentDelay + 0.24,
                                          ease: 'easeOut',
                                        },
                                      }
                                    : { duration: 0 }
                                }
                                className="flex flex-col"
                              >
                                {/* Pay Zero Now Chip */}
                                <div className="px-4 mt-2 flex items-center gap-1 text-xs text-[#A1A1AA]">
                                  <span>or Pay</span>
                                  <span className="font-semibold text-[#FFFFFF] border-b border-dotted border-white/60 pb-0.5 flex items-center gap-1">
                                    ₹{product.price.selling_price} +
                                    <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain inline" />
                                    {product.popstar_coins || 180}
                                  </span>
                                  <span>now</span>
                                </div>

                                {/* SIZE SELECTOR SECTION */}
                                <div className="px-4 pt-3 pb-1">
                                  <div
                                    onClick={() => {
                                      slideScrollRefs.current[idx]?.scrollTo({ top: 380, behavior: 'smooth' });
                                    }}
                                    className="flex items-center justify-between mb-2 cursor-pointer select-none"
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

                                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-2.5">
                                    {productSizes.map((s) => {
                                      const isSizeSelected = selectedSizeId === s.id;
                                      return (
                                        <div key={s.id} className="flex flex-col items-center shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (s.isAvailable) {
                                                setSelectedSizes(prev => ({ ...prev, [product.id]: s.id }));
                                              }
                                            }}
                                            disabled={!s.isAvailable}
                                            className={`min-w-[48px] h-[40px] px-3 rounded-[8px] text-xs font-bold transition-all border flex items-center justify-center ${
                                              isSizeSelected
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
                                  </div>
                                </div>

                                {/* EXTENDED DETAILS */}
                                <div className="mt-1">
                                  {renderScrollDetails && renderScrollDetails(
                                    product,
                                    currentScrollTop > 15,
                                    () => {
                                      slideScrollRefs.current[idx]?.scrollTo({
                                        top: 140,
                                        behavior: 'smooth',
                                      });
                                    }
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          </div>

                          {/* ADD TO CART BUTTON (ENTRANCE ANIMATION: TOP -> BOTTOM only on PLP open) */}
                          <motion.div
                            key={isCartEntrancePhase && idx === safeIndex ? `add-to-cart-container-${product.id}-${animationKey}` : `add-to-cart-container-${idx}`}
                            initial={
                              isCartEntrancePhase && idx === safeIndex
                                ? {
                                    y: tuning.addToCartStartY,
                                    opacity: tuning.addToCartStartOpacity,
                                  }
                                : false
                            }
                            animate={{
                              y: 0,
                              opacity: tuning.addToCartEndOpacity ?? 1,
                            }}
                            transition={
                              isCartEntrancePhase && idx === safeIndex
                                ? {
                                    y: {
                                      duration: tuning.addToCartDuration,
                                      delay: tuning.addToCartDelay,
                                      ease: [0.16, 1, 0.3, 1],
                                    },
                                    opacity: {
                                      duration: tuning.addToCartDuration,
                                      delay: tuning.addToCartDelay,
                                      ease: 'easeOut',
                                    },
                                  }
                                : { duration: 0 }
                            }
                            className={`px-4 pt-1.5 pb-2.5 z-30 shrink-0 pointer-events-auto ${
                              isSlideScrolled
                                ? 'bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/95 to-transparent'
                                : 'bg-gradient-to-t from-[#18181D] via-[#18181D]/95 to-transparent'
                            }`}
                          >
                            <motion.button
                              onClick={() => handleAddToCart(product)}
                              className="w-full h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] transition-all cursor-pointer"
                              style={{
                                background: addedToCartId === product.id
                                ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(180deg, #FFFFFF 0%, #D4D4D8 100%)',
                              color: addedToCartId === product.id ? '#FFFFFF' : '#000000',
                            }}
                          >
                            {addedToCartId === product.id ? (
                              <>
                                <Check size={18} className="text-white" strokeWidth={2.4} />
                                <span className="tracking-tight text-sm font-bold text-white">Added to cart!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={18} className="text-[#000000]" strokeWidth={2.2} />
                                <span className="tracking-tight text-sm font-bold">Add to cart</span>
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              {/* BOTTOM SCROLLING DOCK (Product Selector) */}
              <div
                ref={dockContainerRef}
                style={{
                  height: isScrolled ? 0 : 70,
                  opacity: isScrolled ? 0 : 1,
                  transform: isScrolled ? 'translateY(36px)' : 'translateY(0px)',
                  marginTop: isScrolled ? 0 : 2,
                  pointerEvents: isScrolled ? 'none' : 'auto',
                  transition: 'height 0.28s linear, margin-top 0.28s linear, opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onPointerDown={handleDockPointerDown}
                onPointerMove={handleDockPointerMove}
                onPointerUp={handleDockPointerUp}
                onPointerCancel={handleDockPointerUp}
                onWheel={handleDockWheel}
                className="bottom-dock-container w-full overflow-hidden relative flex items-center py-1 cursor-grab active:cursor-grabbing select-none shrink-0"
              >
                {/* STICKY ACTIVE INDICATOR (White active film and active white border) */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-[22px] w-[44px] h-[58px] ring-2 ring-white ring-offset-2 ring-offset-[#0D0D0D] scale-105 shadow-lg z-20 bg-white/20"
                />

                <motion.div
                  key={`dock-track-${dockEntranceKey}`}
                  className="flex items-center"
                  style={{ gap: `${DOCK_ITEM_GAP}px` }}
                  initial={{
                    x: targetDockX + tuning.bottomCirclesDistance,
                    opacity: tuning.bottomCirclesStartOpacity,
                  }}
                  animate={{
                    x: isClosing
                      ? targetDockX
                      : targetDockX + dockDragOffset + (dragX / (containerWidth + PRODUCT_SLIDE_GAP)) * DOCK_ITEM_STEP,
                    opacity: isClosing ? 0 : 1,
                  }}
                  transition={
                    isEntrancePhase
                      ? {
                          x: {
                            type: 'spring',
                            stiffness: tuning.bottomCirclesStiffness || 240,
                            damping: tuning.bottomCirclesDamping || 18,
                            mass: tuning.bottomCirclesMass || 0.8,
                            bounce: tuning.bottomCirclesBounce ?? 0.25,
                            delay: isClosing ? 0 : tuning.bottomCirclesDelay,
                          },
                          opacity: {
                            duration: tuning.bottomCirclesDuration,
                            ease: 'easeOut',
                            delay: isClosing ? 0 : tuning.bottomCirclesDelay,
                          },
                        }
                      : {
                          type: 'spring',
                          stiffness: tuning.springStiffness || 320,
                          damping: Math.max(tuning.springDamping || 36, 34),
                          mass: 0.8,
                        }
                  }
                >
                  {products.map((p, idx) => {
                    const currentTrackX = isClosing
                      ? targetDockX
                      : targetDockX + dockDragOffset + (dragX / (containerWidth + PRODUCT_SLIDE_GAP)) * DOCK_ITEM_STEP;
                    const centerOffset = dockWidth / 2 - DOCK_ITEM_WIDTH / 2;
                    const distFromCenter = Math.abs((currentTrackX + idx * DOCK_ITEM_STEP) - centerOffset);
                    const centerProximity = Math.max(0, 1 - distFromCenter / DOCK_ITEM_STEP);
                    const thumbOpacity = 0.55 + centerProximity * 0.45;

                    return (
                      <button
                        key={`bottom-thumb-${p.id}-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProduct(idx);
                        }}
                        style={{
                          opacity: thumbOpacity,
                        }}
                        className="relative shrink-0 rounded-[22px] transition-transform duration-200 active:scale-95 flex items-center justify-center cursor-pointer w-[44px] h-[58px] border border-white/20 hover:scale-105"
                        aria-label={`Select ${p.title}`}
                      >
                        <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#1C1C1E] pointer-events-none select-none">
                          <img
                            src={p.images}
                            alt={p.title}
                            className="w-full h-full object-cover object-center pointer-events-none select-none"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = APP_ASSETS.productImage2;
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
