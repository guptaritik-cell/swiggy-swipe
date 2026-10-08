export interface ProductSize {
  id: number;
  size: string;
  is_active: boolean;
  stockLeft?: number;
  availability?: {
    is_available_to_buy: boolean;
    message: string;
    num_available: number;
  };
}

export interface ProductItem {
  id: number | string;
  title: string;
  brand_info: {
    id: number;
    name: string;
    logo?: string | null;
  };
  category?: {
    id?: number;
    name: string;
    full_name?: string;
    banner?: string;
  };
  images: string;
  galleryImages?: string[];
  price: {
    currency: string;
    mrp: number;
    selling_price: number;
    discount_amount: number;
    discount_percent: number;
    popstarCoins?: number;
  };
  offer_price_detail?: {
    bnpl_offer?: {
      emi_amount: number;
      emi_count: number;
      offer_discount: number;
      payable_amount: number;
      selling_price: number;
    };
    product_offer?: {
      offer_discount: number;
      payable_amount: number;
      selling_price: number;
    };
  };
  ratings_info: {
    average_rating: number;
    total_no_of_ratings: number;
  };
  discount_percentage: number;
  popstar_coins: number;
  sizes: ProductSize[];
  availability: {
    is_available_to_buy: boolean;
    message: string;
    num_available: number;
  };
  special_tags?: string | null;
  description?: string;
  features?: string[];
  fabric?: string;
  fit?: string;
  washCare?: string;
}

export interface AnimationTuningConfig {
  // Spring physics for open / close / card expansion
  springStiffness: number; // e.g. 350
  springDamping: number;   // e.g. 30
  springMass: number;      // e.g. 0.8
  
  // Drag-to-close gesture parameters
  dragCloseThreshold: number; // distance in px to trigger close (e.g. 100)
  dragVelocityThreshold: number; // velocity to fling close (e.g. 450)
  
  // Horizontal Carousel swipe parameters
  carouselSensitivity: number; // swipe threshold to page (e.g. 50)
  carouselSpringBounce: number; // 0 (stiff) to 0.4 (bouncy)
  
  // Scroll up collapse parameters ("When user scroll up -543")
  scrollCollapseDistance: number; // scroll distance for full collapse (e.g. 160)
  headerMinScale: number; // scale of image at full scroll (e.g. 0.72)
  headerMinHeight: number; // height in px of compact hero (e.g. 190)
  
  // Visual appearance options
  enableBackdropBlur: boolean;
  showDebugHUD: boolean;
  selectedPreset: 'swiggy' | 'smooth' | 'snappy' | 'bouncy' | 'custom';
}

export const DEFAULT_TUNING_CONFIG: AnimationTuningConfig = {
  springStiffness: 340,
  springDamping: 28,
  springMass: 0.85,
  dragCloseThreshold: 110,
  dragVelocityThreshold: 480,
  carouselSensitivity: 60,
  carouselSpringBounce: 0.15,
  scrollCollapseDistance: 170,
  headerMinScale: 0.75,
  headerMinHeight: 200,
  enableBackdropBlur: true,
  showDebugHUD: false,
  selectedPreset: 'swiggy',
};
