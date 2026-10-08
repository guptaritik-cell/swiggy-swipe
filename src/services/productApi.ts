import { ProductItem } from '../types/product';
import { FEATURED_PRODUCTS, TECHNOSPORT_PRODUCTS, FASTANDUP_PRODUCTS, getBrandRecommendations } from '../data/productsData';

// Simulated API Client with real async data fetching patterns
class ProductApiService {
  private cache = new Map<string, ProductItem[]>();

  // 1. First API call: Product listing on the page
  async getProductListing(datasetKey: 'featured' | 'technosport' | 'fastandup' = 'featured'): Promise<ProductItem[]> {
    // Artificial slight network latency for authentic API feel
    await new Promise(resolve => setTimeout(resolve, 80));

    if (datasetKey === 'technosport') {
      return [...TECHNOSPORT_PRODUCTS];
    }
    if (datasetKey === 'fastandup') {
      return [...FASTANDUP_PRODUCTS];
    }
    return [...FEATURED_PRODUCTS];
  }

  // 2. Second API call: Data of the specific product
  async getProductDetails(id: string | number): Promise<ProductItem> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allProducts = [...FEATURED_PRODUCTS, ...TECHNOSPORT_PRODUCTS, ...FASTANDUP_PRODUCTS];
    const found = allProducts.find(p => String(p.id) === String(id));
    if (!found) {
      return FEATURED_PRODUCTS[0];
    }
    return { ...found };
  }

  // 3. Third API call: See more products at the end (Brand/Category recommendations)
  async getSeeMoreProducts(brandName: string, currentProductId: string | number): Promise<ProductItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getBrandRecommendations(brandName, currentProductId);
  }
}

export const productApi = new ProductApiService();
