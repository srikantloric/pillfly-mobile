import { getStoreProduct, listStoreProducts } from "@/features/product/api/product.api";
import { mapStoreProduct } from "@/features/product/api/mapStoreProduct";
import type { Product } from "@/features/product/types/product";
import { ProductRequestError } from "@/features/product/utils/productRequestError";

const productCache = new Map<string, Product>();

function remember(product: Product): Product {
  productCache.set(product.id, product);
  return product;
}

export function resetProductCache(): void {
  productCache.clear();
}

export const productService = {
  getAllProducts(): Product[] {
    return Array.from(productCache.values());
  },

  getProductById(id: string): Product | undefined {
    return productCache.get(id);
  },

  async fetchProductById(id: string): Promise<Product | undefined> {
    try {
      const response = await getStoreProduct(id);
      return remember(mapStoreProduct(response.data));
    } catch (error) {
      if (error instanceof ProductRequestError && error.status === 404) {
        return undefined;
      }

      throw error;
    }
  },

  getProductsByCategory(_categoryId: string): Product[] {
    return [];
  },

  searchProducts(query: string): Product[] {
    const normalizedQuery = query.trim().toLowerCase();
    const products = Array.from(productCache.values());

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => product.title.toLowerCase().includes(normalizedQuery));
  },

  async getProducts(): Promise<Product[]> {
    const response = await listStoreProducts();
    return response.data.map((product) => remember(mapStoreProduct(product)));
  },
};
