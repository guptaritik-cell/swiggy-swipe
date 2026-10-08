import { ProductItem } from '../types/product';

export const APP_ASSETS = {
  popCoin: 'https://nrchgsvmkvqjhkqhsdqg.supabase.co/storage/v1/object/public/Misc/POPcoin.png',
  popChopBanner: 'https://nrchgsvmkvqjhkqhsdqg.supabase.co/storage/v1/object/public/Misc/P3%20offer%20application.png',
  popChopProductPricing: 'https://nrchgsvmkvqjhkqhsdqg.supabase.co/storage/v1/object/public/Misc/POP%20chop%20pricing.png',
  popChopIcon: 'https://nrchgsvmkvqjhkqhsdqg.supabase.co/storage/v1/object/public/Misc/popchopicon.png',
  productImage1: 'https://nrchgsvmkvqjhkqhsdqg.supabase.co/storage/v1/object/public/Misc/Sneaker%20Display%20Image%20(2)%201.png',
  productImage2: 'https://nrchgsvmkvqjhkqhsdqg.supabase.co/storage/v1/object/public/Misc/Ai_Catelouging_Image_105_2026-02-27_18-50%201.png',
  purpleTshirt: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
};

// Primary curated collection matching the video & screenshots exactly
export const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: 101,
    title: "Mens White Solid Lace-ups Sneakers",
    brand_info: { id: 1001, name: "Lotto", logo: null },
    category: { name: "Oversized Tees", full_name: "STYLE & FASHION > T-Shirts > Polos" },
    images: APP_ASSETS.productImage2,
    galleryImages: [
      APP_ASSETS.productImage2,
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
    ],
    price: {
      currency: "INR",
      mrp: 1234,
      selling_price: 1999,
      discount_amount: 765,
      discount_percent: 38,
      popstarCoins: 180,
    },
    offer_price_detail: {
      bnpl_offer: {
        emi_amount: 1006,
        emi_count: 3,
        offer_discount: 228,
        payable_amount: 1006,
        selling_price: 1234,
      },
      product_offer: {
        offer_discount: 150,
        payable_amount: 1084,
        selling_price: 1234,
      }
    },
    ratings_info: { average_rating: 4.5, total_no_of_ratings: 1268 },
    discount_percentage: 38,
    popstar_coins: 180,
    sizes: [
      { id: 1, size: 'XS', is_active: true },
      { id: 2, size: 'S', is_active: true },
      { id: 3, size: 'M', is_active: true, stockLeft: 5 },
      { id: 4, size: 'L', is_active: true, stockLeft: 10 },
      { id: 5, size: 'XL', is_active: true },
      { id: 6, size: 'XXL', is_active: true },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 48 },
    special_tags: "Trending",
    features: [
      "Ultra-soft 240 GSM heavy combed cotton",
      "Signature red cloud embroidery on chest",
      "Ribbed polo collar with dual contrast tipping",
      "Relaxed drop-shoulder oversized streetwear fit"
    ],
    fabric: "100% Breathable Combed Cotton Blend",
    fit: "Oversized Drop-Shoulder Fit",
    washCare: "Machine wash cold inside out with like colors"
  },
  {
    id: 102,
    title: "Brown Textured Handbag With Pouch",
    brand_info: { id: 1002, name: "Haute Sauce", logo: null },
    category: { name: "Handbags & Totes", full_name: "STYLE & FASHION > Accessories > Bags" },
    images: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
    ],
    price: {
      currency: "INR",
      mrp: 1999,
      selling_price: 1234,
      discount_amount: 765,
      discount_percent: 38,
      popstarCoins: 180,
    },
    offer_price_detail: {
      bnpl_offer: {
        emi_amount: 1006,
        emi_count: 3,
        offer_discount: 228,
        payable_amount: 1006,
        selling_price: 1234,
      }
    },
    ratings_info: { average_rating: 4.5, total_no_of_ratings: 412 },
    discount_percentage: 38,
    popstar_coins: 180,
    sizes: [
      { id: 1, size: 'One Size', is_active: true, stockLeft: 8 },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 18 },
    special_tags: "Bestseller",
    features: [
      "Hand-woven straw texture with premium vegan leather accents",
      "Detachable zipper coin pouch included",
      "Polished metallic twist lock closure",
      "Spacious main compartment with suede lining"
    ],
    fabric: "Natural Jute Straw & Vegan PU Leather",
    fit: "Structured handheld basket tote",
    washCare: "Wipe with damp cloth; keep away from water"
  },
  {
    id: 103,
    title: "Mens White Solid Lace-ups Sneakers",
    brand_info: { id: 1003, name: "Lotto", logo: null },
    category: { name: "Footwear", full_name: "STYLE & FASHION > Shoes > Sneakers" },
    images: APP_ASSETS.productImage1,
    galleryImages: [
      APP_ASSETS.productImage1,
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80",
    ],
    price: {
      currency: "INR",
      mrp: 3200,
      selling_price: 1899,
      discount_amount: 1301,
      discount_percent: 40,
      popstarCoins: 210,
    },
    offer_price_detail: {
      bnpl_offer: {
        emi_amount: 633,
        emi_count: 3,
        offer_discount: 300,
        payable_amount: 1899,
        selling_price: 1899,
      }
    },
    ratings_info: { average_rating: 4.7, total_no_of_ratings: 840 },
    discount_percentage: 40,
    popstar_coins: 210,
    sizes: [
      { id: 1, size: 'UK 7', is_active: true },
      { id: 2, size: 'UK 8', is_active: true, stockLeft: 3 },
      { id: 3, size: 'UK 9', is_active: true, stockLeft: 7 },
      { id: 4, size: 'UK 10', is_active: true },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 24 },
    special_tags: "New Arrival",
    features: [
      "Engineered breathable mesh upper with TPU overlays",
      "Responsive EVA midsole cushioning for all-day comfort",
      "High-grip rubber tread outsole for multi-surface traction",
      "Ergonomic padded ankle collar and memory foam insole"
    ],
    fabric: "Engineered Mesh & Rubber Sole",
    fit: "Standard Athletic Sneaker Fit",
    washCare: "Wipe clean with sneaker foam or mild soap"
  },
  {
    id: 104,
    title: "Power Trimmer",
    brand_info: { id: 1004, name: "Bombay Shaving Company", logo: null },
    category: { name: "Grooming", full_name: "BEAUTY & CARE > Grooming > Trimmers" },
    images: APP_ASSETS.purpleTshirt,
    galleryImages: [
      APP_ASSETS.purpleTshirt,
      APP_ASSETS.productImage2,
    ],
    price: {
      currency: "INR",
      mrp: 1234,
      selling_price: 1000,
      discount_amount: 234,
      discount_percent: 19,
      popstarCoins: 234,
    },
    offer_price_detail: {
      bnpl_offer: {
        emi_amount: 333,
        emi_count: 3,
        offer_discount: 100,
        payable_amount: 1000,
        selling_price: 1000,
      }
    },
    ratings_info: { average_rating: 4.5, total_no_of_ratings: 520 },
    discount_percentage: 19,
    popstar_coins: 234,
    sizes: [
      { id: 1, size: 'Standard', is_active: true },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 120 },
    features: [
      "Skin-safe titanium-coated ceramic T-blades",
      "120 minutes continuous runtime on 90 min fast charge",
      "IPX7 100% waterproof for wet & dry trimming",
      "Digital LED battery battery percentage display"
    ],
    fabric: "Ergonomic Matte Grip Body",
    fit: "Handheld Grooming Tool",
    washCare: "Rinse head under running water"
  },
  {
    id: 105,
    title: "Women Black Solid Regular Fit Running Shorts",
    brand_info: { id: 1005, name: "ADDYVERO", logo: null },
    category: { name: "Activewear", full_name: "STYLE & FASHION > Bottoms > Shorts" },
    images: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
    ],
    price: {
      currency: "INR",
      mrp: 699,
      selling_price: 399,
      discount_amount: 300,
      discount_percent: 43,
      popstarCoins: 45,
    },
    ratings_info: { average_rating: 4.6, total_no_of_ratings: 310 },
    discount_percentage: 43,
    popstar_coins: 45,
    sizes: [
      { id: 1, size: 'S', is_active: true },
      { id: 2, size: 'M', is_active: true, stockLeft: 4 },
      { id: 3, size: 'L', is_active: true },
      { id: 4, size: 'XL', is_active: true },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 64 },
    features: [
      "4-way stretch quick-drying fabric",
      "Concealed zipper pocket for phone & keys",
      "High-rise elasticated waistband with internal drawcord"
    ],
    fabric: "88% Polyester, 12% Spandex",
    fit: "Regular Athleisure Fit",
    washCare: "Cold gentle cycle"
  }
];

// Real Technosport Apparel Dataset (parsed from user JSON)
export const TECHNOSPORT_PRODUCTS: ProductItem[] = [
  {
    id: 392250,
    title: "Men Solid Slim Fit Crew Neck Sports T-shirt With Technocool+",
    brand_info: { id: 13150, name: "Technosport", logo: null },
    category: { name: "Workout Wear", full_name: "STYLE & FASHION > Activewear > Workout Wear" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/MTOR10BLKSML_MTOR10BLK_0_20241130_132640.jpg",
    price: { currency: "INR", mrp: 339, selling_price: 322, discount_amount: 16, discount_percent: 5, popstarCoins: 16 },
    ratings_info: { average_rating: 4.4, total_no_of_ratings: 155 },
    discount_percentage: 5,
    popstar_coins: 14,
    sizes: [
      { id: 393545, size: 'S', is_active: true, stockLeft: 256 },
      { id: 393546, size: 'M', is_active: true, stockLeft: 1078 },
      { id: 393547, size: 'L', is_active: true, stockLeft: 1610 },
      { id: 393548, size: 'XL', is_active: true, stockLeft: 871 },
      { id: 393549, size: '2XL', is_active: true, stockLeft: 872 },
    ],
    availability: { is_available_to_buy: true, message: "In stock (872 available)", num_available: 872 },
    special_tags: "offer_25",
    features: [
      "Technocool+ temperature-regulating sweat dispersion",
      "UPF 50+ sun protection shield",
      "Anti-microbial & anti-odor fabric protection",
      "Ergonomic flatlock non-chafing seams"
    ],
    fabric: "100% Performance Micro-Polyester",
    fit: "Slim Fit Athletic Cut",
    washCare: "Machine wash cold inside out"
  },
  {
    id: 2172827,
    title: "Men Grey Solid Slim Fit Innerwear Vest With Technocool+",
    brand_info: { id: 13150, name: "Technosport", logo: null },
    category: { name: "Workout Wear", full_name: "STYLE & FASHION > Activewear > Workout Wear" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/baaedffd-78df-4895-a118-5eb983c100d0_0_20260812_125328.jpg",
    price: { currency: "INR", mrp: 339, selling_price: 313, discount_amount: 23, discount_percent: 7, popstarCoins: 16 },
    ratings_info: { average_rating: 4.3, total_no_of_ratings: 3 },
    discount_percentage: 7,
    popstar_coins: 17,
    sizes: [
      { id: 2173042, size: 'S', is_active: true, stockLeft: 13 },
      { id: 2173043, size: 'M', is_active: true, stockLeft: 8 },
      { id: 2173045, size: 'XL', is_active: true, stockLeft: 30 },
      { id: 2173046, size: '2XL', is_active: true, stockLeft: 20 },
    ],
    availability: { is_available_to_buy: true, message: "In stock (20 available)", num_available: 20 },
    features: ["Breathable mesh knit", "Deep armholes for unrestricted movement"],
    fabric: "Breathable Jacquard Knit",
    fit: "Athletic Vest Fit",
    washCare: "Hand or machine wash gentle"
  },
  {
    id: 2147625,
    title: "Men Multicolor Colorblock Slim Fit Round Neck Sports T-shirt With Technocool+",
    brand_info: { id: 13150, name: "Technosport", logo: null },
    category: { name: "Workout Wear", full_name: "STYLE & FASHION > Activewear > Workout Wear" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/db576a30-507f-4d5f-8dc7-42fd326d7c00_0_20260730_134909.jpg",
    price: { currency: "INR", mrp: 429, selling_price: 396, discount_amount: 30, discount_percent: 7, popstarCoins: 20 },
    ratings_info: { average_rating: 4.8, total_no_of_ratings: 4 },
    discount_percentage: 7,
    popstar_coins: 21,
    sizes: [
      { id: 2147757, size: 'M', is_active: true, stockLeft: 81 },
      { id: 2147758, size: 'L', is_active: true, stockLeft: 318 },
      { id: 2147759, size: 'XL', is_active: true, stockLeft: 317 },
    ],
    availability: { is_available_to_buy: true, message: "In stock (317 available)", num_available: 317 },
    features: ["Dynamic colorblock contrast panels", "Rapid dry technology"],
    fabric: "Polyester Elastane Blend",
    fit: "Slim Fit",
    washCare: "Normal wash"
  },
  {
    id: 1052338,
    title: "Men's Off White Solid Slim Fit Round Neck Sports T-shirt With Cotflex",
    brand_info: { id: 13150, name: "Technosport", logo: null },
    category: { name: "Workout Wear", full_name: "STYLE & FASHION > Activewear > Workout Wear" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/90836ded-9bb9-457f-a4c7-fa162bb58157_4_20251008_130759.jpg",
    price: { currency: "INR", mrp: 429, selling_price: 396, discount_amount: 30, discount_percent: 7, popstarCoins: 20 },
    ratings_info: { average_rating: 5.0, total_no_of_ratings: 1 },
    discount_percentage: 7,
    popstar_coins: 21,
    sizes: [
      { id: 1052660, size: 'XXL', is_active: true, stockLeft: 19 },
      { id: 1052661, size: 'L', is_active: true, stockLeft: 5 },
      { id: 1052662, size: 'M', is_active: true, stockLeft: 7 },
      { id: 1052664, size: 'XL', is_active: true, stockLeft: 14 },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 14 },
    special_tags: "offer_25",
    features: ["Cotflex cotton-stretch comfort", "Anti-pilling weave"],
    fabric: "Cotflex Breathable Cotton Blend",
    fit: "Slim Fit",
    washCare: "Machine wash cold"
  },
  {
    id: 1549058,
    title: "Men Navy Blue Slim Fit Active Running Shorts",
    brand_info: { id: 13150, name: "Technosport", logo: null },
    category: { name: "Shorts", full_name: "STYLE & FASHION > Bottoms > Shorts" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/e38e46c9-299c-4907-b9dd-45cf26d776a0_0_20260323_125142.jpg",
    price: { currency: "INR", mrp: 479, selling_price: 455, discount_amount: 23, discount_percent: 5, popstarCoins: 23 },
    ratings_info: { average_rating: 4.6, total_no_of_ratings: 8 },
    discount_percentage: 5,
    popstar_coins: 22,
    sizes: [
      { id: 1549209, size: 'M', is_active: true, stockLeft: 13 },
      { id: 1549210, size: 'L', is_active: true, stockLeft: 8 },
      { id: 1549211, size: 'XL', is_active: true, stockLeft: 12 },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 11 },
    special_tags: "offer_25",
    features: ["Featherlight woven construction", "Internal brief lining", "Zipped side pockets"],
    fabric: "Polyester Stretch Weave",
    fit: "Slim Fit Running Cut",
    washCare: "Machine wash gentle"
  },
  {
    id: 1827457,
    title: "Men Yellow Solid Oversized Pull-on T-shirt With Elastoplus",
    brand_info: { id: 13150, name: "Technosport", logo: null },
    category: { name: "Oversized Tees", full_name: "STYLE & FASHION > T-Shirts > Oversized" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/5ed51419-2e4e-4a97-a154-9ea23a4fff32_0_20260420_062701.jpg",
    price: { currency: "INR", mrp: 449, selling_price: 415, discount_amount: 31, discount_percent: 7, popstarCoins: 21 },
    ratings_info: { average_rating: 5.0, total_no_of_ratings: 2 },
    discount_percentage: 7,
    popstar_coins: 22,
    sizes: [
      { id: 1827576, size: 'M', is_active: true, stockLeft: 510 },
      { id: 1827577, size: 'L', is_active: true, stockLeft: 574 },
      { id: 1827578, size: 'XL', is_active: true, stockLeft: 529 },
    ],
    availability: { is_available_to_buy: true, message: "In stock", num_available: 331 },
    features: ["Elastoplus 360 degree mobility", "Vibrant wash-fast dye"],
    fabric: "Elastoplus Stretch Cotton",
    fit: "Oversized Casual Fit",
    washCare: "Machine wash cold"
  }
];

// Real Fast&Up Nutrition Dataset (parsed from user JSON)
export const FASTANDUP_PRODUCTS: ProductItem[] = [
  {
    id: 2167336,
    title: "Charge - Immunity Booster - Amla Rich Natural Vitamin C + Zinc - Orange",
    brand_info: { id: 38280, name: "Fast&Up", logo: null },
    category: { name: "Immunity Boost", full_name: "HEALTH & SELF > Health Goals > Immunity Boost" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/4af58262-fa6c-46cc-b130-df876d43a52f_1_20260810_105803.jpg",
    price: { currency: "INR", mrp: 379, selling_price: 289, discount_amount: 87, discount_percent: 23, popstarCoins: 14 },
    ratings_info: { average_rating: 4.8, total_no_of_ratings: 1420 },
    discount_percentage: 23,
    popstar_coins: 19,
    sizes: [
      { id: 1, size: '20 Tablets', is_active: true, stockLeft: 753 },
      { id: 2, size: '60 Tablets (Pack of 3)', is_active: true, stockLeft: 310 }
    ],
    availability: { is_available_to_buy: true, message: "In stock (753 available)", num_available: 753 },
    features: [
      "Natural Amla extract 1000mg with 10mg elemental Zinc",
      "Effervescent fast-absorbing Swiss formula",
      "Gentle on stomach, zero added sugar",
      "Crisp orange fizz for everyday immune defense"
    ],
    fabric: "Effervescent Drink Tablets",
    fit: "Daily Wellness Supplement",
    washCare: "Drop 1 tablet in 250ml water, dissolve and drink"
  },
  {
    id: 2167015,
    title: "Pre Workout - Orange - 30 Servings 300g",
    brand_info: { id: 38280, name: "Fast&Up", logo: null },
    category: { name: "Protein Power", full_name: "HEALTH & SELF > Health Goals > Protein Power" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/609310b0-3033-4a9e-bdab-0950818e00a8_1_20260807_122652.jpg",
    price: { currency: "INR", mrp: 1870, selling_price: 1299, discount_amount: 561, discount_percent: 30, popstarCoins: 65 },
    ratings_info: { average_rating: 4.4, total_no_of_ratings: 58 },
    discount_percentage: 30,
    popstar_coins: 94,
    sizes: [
      { id: 1, size: '300g (30 Servings)', is_active: true, stockLeft: 154 }
    ],
    availability: { is_available_to_buy: true, message: "In stock (154 available)", num_available: 154 },
    features: ["Intense energy matrix with Beta-Alanine and L-Citrulline", "No post-workout crash"],
    fabric: "Micro-filtered Powder",
    fit: "Pre-Workout Formulation",
    washCare: "Mix 1 scoop with 300ml cold water 20 mins before workout"
  },
  {
    id: 2166867,
    title: "Creatine Monohydrate - 33 Servings - Orange 171.3g",
    brand_info: { id: 38280, name: "Fast&Up", logo: null },
    category: { name: "Protein Power", full_name: "HEALTH & SELF > Health Goals > Protein Power" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/6d98d050-2e8d-4e22-b6b4-c73f103fb39a_1_20260807_104318.jpg",
    price: { currency: "INR", mrp: 665, selling_price: 369, discount_amount: 292, discount_percent: 44, popstarCoins: 18 },
    ratings_info: { average_rating: 4.6, total_no_of_ratings: 91 },
    discount_percentage: 44,
    popstar_coins: 33,
    sizes: [
      { id: 1, size: '171.3g', is_active: true, stockLeft: 88 }
    ],
    availability: { is_available_to_buy: true, message: "In stock (88 available)", num_available: 88 },
    features: ["100% Ultra-micronized pure creatine", "Promotes ATP regeneration & muscle strength"],
    fabric: "Ultra Micronized",
    fit: "Strength & Power Support",
    washCare: "Take 1 scoop daily with water or juice"
  },
  {
    id: 2166865,
    title: "L-carnitine 3000mg Fat Burner - Lemon 60g",
    brand_info: { id: 38280, name: "Fast&Up", logo: null },
    category: { name: "Weight Care", full_name: "HEALTH & SELF > Health Goals > Weight Care" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/f0e891b5-cea2-4231-acc2-3c669f7bed36_7_20260807_104518.jpg",
    price: { currency: "INR", mrp: 849, selling_price: 689, discount_amount: 152, discount_percent: 18, popstarCoins: 34 },
    ratings_info: { average_rating: 4.5, total_no_of_ratings: 420 },
    discount_percentage: 18,
    popstar_coins: 42,
    sizes: [
      { id: 1, size: '60g Liquid Shot', is_active: true, stockLeft: 1984 }
    ],
    availability: { is_available_to_buy: true, message: "In stock (1984 available)", num_available: 1984 },
    features: ["Converts fatty acids into cellular energy", "Fast acting liquid formulation"],
    fabric: "Liquid Concentrate",
    fit: "Metabolism Booster",
    washCare: "Consume 1 shot prior to morning workout"
  },
  {
    id: 2166855,
    title: "Reload Zero Sugar Instant Hydration Drink - Lime Lemon 25 Tablet 110g",
    brand_info: { id: 38280, name: "Fast&Up", logo: null },
    category: { name: "Healthy Drinks", full_name: "HEALTH & SELF > Wellness Tonics > Healthy Drinks" },
    images: "https://ik.imagekit.io/t2vt6tx4m/media/compressed-images/459c3947-6419-4dc9-9e26-66dfdae17615_5_20260807_104401.jpg",
    price: { currency: "INR", mrp: 325, selling_price: 240, discount_amount: 84, discount_percent: 26, popstarCoins: 12 },
    ratings_info: { average_rating: 4.7, total_no_of_ratings: 812 },
    discount_percentage: 26,
    popstar_coins: 16,
    sizes: [
      { id: 1, size: '25 Tablets', is_active: true, stockLeft: 519 }
    ],
    availability: { is_available_to_buy: true, message: "In stock (519 available)", num_available: 519 },
    features: ["5 essential electrolytes: Sodium, Potassium, Magnesium, Calcium, Chlorides", "0g sugar, low calorie"],
    fabric: "Effervescent Hydration",
    fit: "Intra-Workout Hydration",
    washCare: "Drop in 500ml water during exercise"
  }
];

// "More from this brand" / recommendations data generator
export const getBrandRecommendations = (brandName: string, currentId: number | string): ProductItem[] => {
  const pool = [...FEATURED_PRODUCTS, ...TECHNOSPORT_PRODUCTS, ...FASTANDUP_PRODUCTS];
  const powerTrimmer = FEATURED_PRODUCTS.find(p => p.id === 104);
  // Ensure the Power Trimmer card shown in the screenshot is featured
  let matches = pool.filter(p => p.brand_info.name.toLowerCase() === brandName.toLowerCase() && p.id !== currentId);
  if (powerTrimmer && currentId !== 104 && !matches.some(m => m.id === 104)) {
    matches.unshift(powerTrimmer);
  }
  if (matches.length < 4) {
    const additional = pool.filter(p => p.id !== currentId && !matches.some(m => m.id === p.id));
    matches = [...matches, ...additional];
  }
  return matches.slice(0, 6);
};
