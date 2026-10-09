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
  Share2,
  Star,
} from 'lucide-react';
import { ProductItem, AnimationTuningConfig } from '../types/product';
import { APP_ASSETS } from '../data/productsData';

interface CoreProductAnimationProps {
  products: ProductItem[];
  tuning: AnimationTuningConfig;
  onProductSelect?: (product: ProductItem | null) => void;
  activeProductIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  renderScrollDetails?: (product: ProductItem, isScrolledUp: boolean, onExpand?: () => void) => React.ReactNode;
  onScrollDelta?: (scrollTop: number) => void;
}

export const CoreProductAnimation: React.FC<CoreProductAnimationProps> = ({
  products,
  tuning,
  onProductSelect,
  activeProductIndex: externalIndex,
  onActiveIndexChange,
  renderScrollDetails,
  onScrollDelta,
}) => {
  const [internalIndex, setInternalIndex] = useState<number | null>(null);
  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;

  // Track gallery image index within the currently active product
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Selected size id
  const [selectedSizeId, setSelectedSizeId] = useState<string>('m');

  // Pull-down drag distance for pull-to-close gesture
  const [dragY, setDragY] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // "Slide down to go back" onboarding nudge state
  const [showSwipeDownNudge, setShowSwipeDownNudge] = useState<boolean>(false);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time drag displacement for content swipe
  const [contentDragX, setContentDragX] = useState<number>(0);

  // Real-time drag offset for bottom dock
  const [dockDragOffset, setDockDragOffset] = useState<number>(0);

  // Track scroll position to determine whether scroll-up or pull-down applies
  const [scrollTop, setScrollTop] = useState<number>(0);
  const isScrolled = scrollTop > 15;

  // Wishlist state
  const [wishlist, setWishlist] = useState<Record<string | number, boolean>>({});

  // Filter chips in PLP
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);
  const extendedDetailsRef = useRef<HTMLDivElement | null>(null);
  const dockContainerRef = useRef<HTMLDivElement | null>(null);

  // Track container width for centering calculations
  const [dockWidth, setDockWidth] = useState<number>(360);

  useEffect(() => {
    if (!dockContainerRef.current) return;
    const updateWidth = () => {
      if (dockContainerRef.current) {
        setDockWidth(dockContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(dockContainerRef.current);
    return () => ro.disconnect();
  }, [activeIndex]);

  const safeIndex = activeIndex !== null && activeIndex >= 0 && activeIndex < products.length ? activeIndex : 0;
  const currentProduct = activeIndex !== null && activeIndex >= 0 ? products[safeIndex] : null;
  const nudgeShiftY = (showSwipeDownNudge && !isScrolled) ? 8 : 0;

  // Multiple images for the current active product
  const productImages = currentProduct?.galleryImages && currentProduct.galleryImages.length > 0
    ? currentProduct.galleryImages
    : currentProduct ? [currentProduct.images] : [];

  // Navigate to next product (and update bottom active product)
  const handleNextProduct = useCallback(() => {
    if (!products || products.length === 0) return;
    const curr = activeIndex ?? 0;
    const nextIdx = curr < products.length - 1 ? curr + 1 : 0;
    handleOpenProduct(nextIdx);
  }, [products, activeIndex]);

  // Navigate to previous product
  const handlePrevProduct = useCallback(() => {
    if (!products || products.length === 0) return;
    const curr = activeIndex ?? 0;
    const prevIdx = curr > 0 ? curr - 1 : products.length - 1;
    handleOpenProduct(prevIdx);
  }, [products, activeIndex]);

  // Reset image index and scroll positions when switching active product
  useEffect(() => {
    setActiveImageIndex(0);
    setDragY(0);
    setContentDragX(0);
    setDockDragOffset(0);
    setIsPulling(false);
    setScrollTop(0);
    if (carouselTrackRef.current) {
      carouselTrackRef.current.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }

    // Trigger smooth "Slide down to go back" nudge after ~0.7s delay (0.5-1s after product is clicked)
    setShowSwipeDownNudge(false);
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    if (nudgeHideTimerRef.current) clearTimeout(nudgeHideTimerRef.current);

    if (activeIndex !== null && activeIndex >= 0) {
      nudgeTimerRef.current = setTimeout(() => {
        setShowSwipeDownNudge(true);
        nudgeHideTimerRef.current = setTimeout(() => {
          setShowSwipeDownNudge(false);
        }, 2000);
      }, 700);
    }

    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      if (nudgeHideTimerRef.current) clearTimeout(nudgeHideTimerRef.current);
    };
  }, [activeIndex]);

  const handleScrollToImage = (index: number) => {
    setActiveImageIndex(index);
    if (carouselTrackRef.current) {
      const containerWidth = carouselTrackRef.current.clientWidth;
      const cardWidth = containerWidth * 0.82;
      const gap = 12;
      carouselTrackRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth',
      });
    }
  };

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const containerWidth = e.currentTarget.clientWidth;
    const cardWidth = containerWidth * 0.82;
    const gap = 12;
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    if (newIndex >= 0 && newIndex < productImages.length && newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
    }
  };

  const toggleWishlist = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenProduct = useCallback((index: number) => {
    setIsClosing(false);
    setActiveImageIndex(0);
    setDragY(0);
    setContentDragX(0);
    setDockDragOffset(0);
    setIsPulling(false);
    setScrollTop(0);
    if (onActiveIndexChange) {
      onActiveIndexChange(index);
    } else {
      setInternalIndex(index);
    }
    if (products[index]) {
      onProductSelect?.(products[index]);
    }
  }, [onActiveIndexChange, onProductSelect, products]);

  // Smoothly trigger collapse back into small card in PLP
  const handleCloseProduct = useCallback(() => {
    setIsClosing(true);
    setDragY(0);
    setContentDragX(0);
    setDockDragOffset(0);
    setIsPulling(false);

    if (onActiveIndexChange) {
      onActiveIndexChange(-1);
    } else {
      setInternalIndex(null);
    }
    onProductSelect?.(null);

    setTimeout(() => {
      setIsClosing(false);
    }, 450);
  }, [onActiveIndexChange, onProductSelect]);

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

  // Smooth scroll up from preview into extended details
  const scrollToExtendedDetails = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 480,
        behavior: 'smooth',
      });
    }
  };

  // Scroll listener on main PDP scroll body
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const st = e.currentTarget.scrollTop;
    setScrollTop(st);
    onScrollDelta?.(st);
  };

  // Content swiping pointer events
  const isContentPointerDownRef = useRef<boolean>(false);
  const contentStartXRef = useRef<number>(0);
  const contentStartYRef = useRef<number>(0);
  const isHorizontalContentSwipeRef = useRef<boolean>(false);
  const hasDecidedContentDirectionRef = useRef<boolean>(false);

  const handleContentPointerDown = (e: React.PointerEvent) => {
    if (isScrolled) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('.hero-image-carousel')) return;

    isContentPointerDownRef.current = true;
    contentStartXRef.current = e.clientX;
    contentStartYRef.current = e.clientY;
    isHorizontalContentSwipeRef.current = false;
    hasDecidedContentDirectionRef.current = false;
  };

  const handleContentPointerMove = (e: React.PointerEvent) => {
    if (!isContentPointerDownRef.current || isScrolled) return;
    const dx = e.clientX - contentStartXRef.current;
    const dy = e.clientY - contentStartYRef.current;

    if (!hasDecidedContentDirectionRef.current) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        hasDecidedContentDirectionRef.current = true;
        if (Math.abs(dx) > Math.abs(dy)) {
          isHorizontalContentSwipeRef.current = true;
        }
      }
    }

    if (isHorizontalContentSwipeRef.current) {
      setContentDragX(dx * 0.85);
    }
  };

  const handleContentPointerUp = (e: React.PointerEvent) => {
    if (!isContentPointerDownRef.current) return;
    isContentPointerDownRef.current = false;

    if (isHorizontalContentSwipeRef.current) {
      const dx = e.clientX - contentStartXRef.current;
      if (dx < -25) {
        handleNextProduct();
      } else if (dx > 25) {
        handlePrevProduct();
      }
    }

    setContentDragX(0);
    isHorizontalContentSwipeRef.current = false;
    hasDecidedContentDirectionRef.current = false;
  };

  // ========================================================
  // Pull-to-Close Touch & Pointer Gestures (scrollTop <= 2)
  // Card moves down a little bit, then collapses to small card
  // ========================================================
  const pullStartYRef = useRef<number>(0);
  const pullStartXRef = useRef<number>(0);
  const isPullTrackingRef = useRef<boolean>(false);
  const isPullDecidedRef = useRef<boolean>(false);

  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('.bottom-dock-container')) return;

    const st = scrollContainerRef.current?.scrollTop ?? 0;
    if (st <= 2) {
      pullStartYRef.current = e.clientY;
      pullStartXRef.current = e.clientX;
      isPullTrackingRef.current = true;
      isPullDecidedRef.current = false;
    }
  };

  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPullTrackingRef.current) return;
    const dy = e.clientY - pullStartYRef.current;
    const dx = Math.abs(e.clientX - pullStartXRef.current);

    if (!isPullDecidedRef.current) {
      if (Math.abs(dy) > 6 || dx > 6) {
        if (dy > 8 && dy > dx * 1.1) {
          isPullDecidedRef.current = true;
          setIsPulling(true);
        } else {
          isPullTrackingRef.current = false;
          return;
        }
      }
    }

    if (isPullDecidedRef.current && dy > 0) {
      const dampedY = dy < 60 ? dy : 60 + Math.pow(dy - 60, 0.82);
      setDragY(dampedY);
    } else if (dy <= 0) {
      setDragY(0);
      setIsPulling(false);
    }
  };

  const handleContainerPointerUp = () => {
    if (isPullTrackingRef.current && isPulling) {
      if (dragY > 38) {
        handleCloseProduct();
      } else {
        setDragY(0);
      }
      setIsPulling(false);
    }
    isPullTrackingRef.current = false;
    isPullDecidedRef.current = false;
  };

  // Trackpad / mouse wheel scroll top-to-bottom listener
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const st = scrollContainerRef.current?.scrollTop ?? 0;
    if (st <= 2 && e.deltaY < -6) {
      // Moves card down a little bit first, then triggers collapse
      setDragY(prev => Math.min(50, prev + Math.abs(e.deltaY) * 0.45));
      setIsPulling(true);

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        handleCloseProduct();
      }, 90);
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
                transition={smoothSpringTransition}
                onClick={() => handleOpenProduct(idx)}
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
            transition={smoothSpringTransition}
            animate={{
              y: dragY,
              scale: 1 - Math.min(dragY / 1200, 0.04),
              borderRadius: Math.min(24, Math.max(0, dragY * 0.3)),
            }}
            className={`absolute inset-0 z-50 flex flex-col bg-[#0D0D0D] overflow-hidden ${
              tuning.enableBackdropBlur ? 'backdrop-blur-xl' : ''
            }`}
          >
            {/* Slide Down Nudge */}
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
                    Slide down to go back
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
                height: isScrolled ? 48 : 42,
                y: nudgeShiftY,
                opacity: isClosing ? 0 : 1,
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
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
                transition={{ type: 'spring', stiffness: 340, damping: 36 }}
                onClick={() => {
                  if (scrollTop > 20 && scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
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
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
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
                  transition={{ duration: 0.2 }}
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
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform"
                  aria-label="Cart"
                >
                  <ShoppingCart size={isScrolled ? 19 : 16} className="text-[#FFFFFF]" />
                </motion.button>

                <div className="flex items-center gap-1.5 px-2.5 py-1 border border-white/15 rounded-full bg-black/60 backdrop-blur-md shadow-md">
                  <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span className="text-xs font-semibold text-[#FFFFFF]">43K</span>
                </div>
              </motion.div>

              {!isScrolled && <div className="w-8 shrink-0 pointer-events-none" />}
            </motion.div>

            {/* PULL-DOWN-TO-DISMISS CONTAINER */}
            <motion.div
              animate={{
                y: nudgeShiftY,
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="flex-1 flex flex-col overflow-hidden relative bg-[#0D0D0D]"
            >
              {/* PULL INDICATOR BAR (Visible when card goes down) */}
              {dragY > 10 && (
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/40 z-50 pointer-events-none" />
              )}

              {/* SCROLLABLE PDP BODY */}
              <div
                id="pdp-scroll-container"
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onWheel={handleWheel}
                onPointerDown={handleContainerPointerDown}
                onPointerMove={handleContainerPointerMove}
                onPointerUp={handleContainerPointerUp}
                onPointerCancel={handleContainerPointerUp}
                className="flex-1 overflow-y-auto no-scrollbar pt-10 pb-28 bg-[#0D0D0D] overscroll-none"
              >
                {/* INITIAL PREVIEW SCREEN */}
                <div ref={previewSectionRef} className="flex flex-col">
                  
                  {/* PRODUCT IMAGE GALLERY CAROUSEL */}
                  <div className="hero-image-carousel relative w-full pt-1 pb-1 overflow-hidden">
                    <div
                      ref={carouselTrackRef}
                      onScroll={handleCarouselScroll}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full flex gap-3 px-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x"
                      style={{
                        scrollSnapType: 'x mandatory',
                        scrollPaddingLeft: '16px',
                        scrollPaddingRight: '16px',
                      }}
                    >
                      {productImages.map((imgUrl, i) => (
                        <div
                          key={`gallery-img-${i}-${currentProduct.id}`}
                          onClick={() => handleScrollToImage(i)}
                          className={`w-[82%] aspect-[1/1.05] shrink-0 rounded-[28px] overflow-hidden bg-[#161616] border border-[#262626] snap-center relative shadow-xl cursor-pointer transition-all duration-200 ${
                            i === activeImageIndex
                              ? 'opacity-100 ring-1 ring-white/10'
                              : 'opacity-70 hover:opacity-90'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Photo ${i + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center pointer-events-none select-none"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = APP_ASSETS.productImage2;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FADE-IN WRAPPER FOR PDP INNER CONTENT */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 1 }}
                    transition={{ duration: isClosing ? 0.15 : 0.22, delay: isClosing ? 0 : 0.06 }}
                    className="flex flex-col"
                  >
                    {/* ACTION ROW: RATING, HEART, SHARE */}
                    <motion.div
                      initial={false}
                      animate={{
                        y: isScrolled ? 0 : -44,
                        marginBottom: isScrolled ? 8 : -36,
                        paddingLeft: isScrolled ? 16 : 24,
                        paddingRight: isScrolled ? 16 : 24,
                      }}
                      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
                      className="relative z-20 flex items-center justify-between pointer-events-auto"
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor: isScrolled ? '#1C1C1E' : 'rgba(0,0,0,0.60)',
                          paddingTop: isScrolled ? 2 : 2,
                          paddingBottom: isScrolled ? 2 : 2,
                          paddingLeft: isScrolled ? 8 : 8,
                          paddingRight: isScrolled ? 8 : 8,
                          borderRadius: isScrolled ? 5 : 5,
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1 shadow-md backdrop-blur-md select-none"
                      >
                        <Star
                          size={isScrolled ? 10 : 11}
                          className="fill-[#FFFFFF] text-[#FFFFFF] transition-all"
                        />
                        <span className={`font-bold text-[#FFFFFF] transition-all ${isScrolled ? 'text-[10px]' : 'text-[11px]'}`}>
                          {currentProduct.ratings_info?.average_rating || 4.5}
                        </span>
                      </motion.div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          initial={false}
                          animate={{
                            width: isScrolled ? 28 : 28,
                            height: isScrolled ? 28 : 28,
                            backgroundColor: isScrolled ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.60)',
                            boxShadow: isScrolled ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                          }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => toggleWishlist(currentProduct.id, e)}
                          className="rounded-full backdrop-blur-md flex items-center justify-center text-[#FFFFFF] active:scale-90 transition-transform"
                          aria-label="Wishlist"
                        >
                          <Heart
                            size={isScrolled ? 15 : 16}
                            className={wishlist[currentProduct.id] ? "fill-red-500 text-red-500" : "text-[#FFFFFF]"}
                          />
                        </motion.button>

                        <motion.button
                          initial={false}
                          animate={{
                            width: isScrolled ? 28 : 28,
                            height: isScrolled ? 28 : 28,
                            backgroundColor: isScrolled ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.60)',
                            boxShadow: isScrolled ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                          }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (navigator.share) {
                              navigator.share({ title: currentProduct.title, url: window.location.href }).catch(() => {});
                            }
                          }}
                          className="rounded-full backdrop-blur-md flex items-center justify-center text-[#FFFFFF] active:scale-90 transition-transform"
                          aria-label="Share"
                        >
                          <Share2 size={15} className="text-[#FFFFFF]" />
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* SWIPEABLE CONTENT WRAPPER */}
                    <motion.div
                      animate={{ x: contentDragX }}
                      transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.7 }}
                      onPointerDown={handleContentPointerDown}
                      onPointerMove={handleContentPointerMove}
                      onPointerUp={handleContentPointerUp}
                      onPointerCancel={handleContentPointerUp}
                      className="flex flex-col select-none touch-pan-y cursor-grab active:cursor-grabbing"
                    >
                      {/* Brand name */}
                      <div className="px-4 pt-1.5 pointer-events-none">
                        <span className="text-[11px] font-medium text-[#8E8E93] border-b border-dotted border-[#8E8E93] pb-0.5 inline-block cursor-default">
                          {currentProduct.brand_info.name}
                        </span>
                        <h1 className="text-[15px] font-semibold text-[#FFFFFF] leading-snug mt-1">
                          {currentProduct.title}
                        </h1>
                      </div>

                      {/* Price Section */}
                      <div className="px-4 pt-1 pointer-events-none">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-[#FFFFFF]">
                            ₹{currentProduct.price.selling_price}
                          </span>
                          {currentProduct.price.mrp > currentProduct.price.selling_price && (
                            <span className="text-xs font-semibold text-[#71717A] line-through">
                              ₹{currentProduct.price.mrp}
                            </span>
                          )}
                        </div>

                        {/* POPchop Offer Banner */}
                        <div 
                          className="mt-[19px] rounded-[14px] p-2.5 border border-purple-500/20 relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer pointer-events-auto"
                          style={{
                            marginTop: '19px',
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
                                  <span>₹{currentProduct.offer_price_detail?.bnpl_offer?.emi_amount || Math.round(currentProduct.price.selling_price / 3)}</span>
                                  <span className="text-[10px] text-white/70">x3mo</span>
                                  <span>+</span>
                                  <img src={APP_ASSETS.popCoin} alt="" className="w-3 h-3 object-contain inline" />
                                  <span>{currentProduct.popstar_coins || 180}</span>
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

                        {/* Pay Zero Now Chip */}
                        <div className="mt-2 flex items-center gap-1 text-xs text-[#A1A1AA]">
                          <span>or Pay</span>
                          <span className="font-semibold text-[#FFFFFF] border-b border-dotted border-white/60 pb-0.5 flex items-center gap-1">
                            ₹{currentProduct.price.selling_price} +
                            <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain inline" />
                            {currentProduct.popstar_coins || 180}
                          </span>
                          <span>now</span>
                        </div>
                      </div>

                      {/* SELECT SIZE SECTION */}
                      <div className="px-4 pt-3 pb-1">
                        <div 
                          onClick={scrollToExtendedDetails}
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
                          {(currentProduct.sizes && currentProduct.sizes.length > 0
                            ? currentProduct.sizes.map((s, idx) => ({
                                id: String(s.id || idx),
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
                              ]
                          ).map((s) => {
                            const isSelected = selectedSizeId === s.id;
                            return (
                              <div key={s.id} className="flex flex-col items-center shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (s.isAvailable) setSelectedSizeId(s.id);
                                  }}
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
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* EXTENDED DETAILS SECTION */}
                <div ref={extendedDetailsRef} className="mt-1">
                  {renderScrollDetails && renderScrollDetails(
                    currentProduct,
                    isScrolled,
                    () => {
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({
                          top: 140,
                          behavior: 'smooth',
                        });
                      }
                    }
                  )}
                </div>
              </div>
            </motion.div>

            {/* STICKY BOTTOM BAR */}
            <motion.div
              animate={{ opacity: isClosing ? 0 : 1 }}
              transition={{ duration: isClosing ? 0.15 : 0.2 }}
              className="absolute bottom-0 left-0 right-0 z-40 px-4 pt-2 pb-2 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/95 to-transparent pointer-events-auto"
            >
              {/* Add to cart Button */}
              <motion.button
                layout
                transition={{ type: 'spring', stiffness: 340, damping: 36 }}
                className="w-full h-12 rounded-full text-[#000000] font-bold text-sm flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] transition-transform mb-3"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #D4D4D8 100%)',
                }}
              >
                <ShoppingCart size={18} className="text-[#000000]" strokeWidth={2.2} />
                <span className="tracking-tight text-sm font-bold">Add to cart</span>
              </motion.button>

              {/* Bottom Scrolling Dock */}
              <motion.div
                ref={dockContainerRef}
                initial={false}
                animate={{
                  height: isScrolled ? 0 : 64,
                  opacity: isScrolled ? 0 : 1,
                  y: isScrolled ? 36 : 0,
                  marginTop: isScrolled ? 0 : 4,
                  pointerEvents: isScrolled ? 'none' : 'auto',
                }}
                transition={{ type: 'spring', stiffness: 340, damping: 36 }}
                onPointerDown={handleDockPointerDown}
                onPointerMove={handleDockPointerMove}
                onPointerUp={handleDockPointerUp}
                onPointerCancel={handleDockPointerUp}
                onWheel={handleDockWheel}
                className="bottom-dock-container w-full overflow-hidden relative flex items-center py-1 cursor-grab active:cursor-grabbing select-none"
              >
                <motion.div
                  className="flex items-center"
                  style={{ gap: `${DOCK_ITEM_GAP}px` }}
                  animate={{
                    x: targetDockX + dockDragOffset + (contentDragX * (DOCK_ITEM_STEP / 200)),
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 36,
                    mass: 0.8,
                  }}
                >
                  {products.map((p, idx) => {
                    const isSelected = idx === safeIndex;
                    return (
                      <button
                        key={`bottom-thumb-${p.id}-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProduct(idx);
                        }}
                        className={`relative shrink-0 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'w-11 h-11 ring-2 ring-white ring-offset-2 ring-offset-[#0D0D0D] scale-110 shadow-lg z-10'
                            : 'w-11 h-11 border border-white/20 opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                        aria-label={`Select ${p.title}`}
                      >
                        <div className="w-full h-full rounded-full overflow-hidden pointer-events-none select-none">
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
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
