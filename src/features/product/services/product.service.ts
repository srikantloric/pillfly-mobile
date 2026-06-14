import { mockProducts } from "@/features/product/mocks/catalog/products.mock";

import type { ProductCategory } from "@/types/category.types";
import type { Product } from "@/features/product/types/product";

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

export const productService = {
  getAllProducts(): Product[] {
    return mockProducts;
  },

  getProductById(id: string): Product | undefined {
    return mockProducts.find((product) => product.id === id);
  },

  async fetchProductById(id: string): Promise<Product | undefined> {
    return Promise.resolve(mockProducts.find((product) => product.id === id));
  },

  getProductsByCategory(categoryId: string): Product[] {
    const normalizedCategoryId = normalize(categoryId) as ProductCategory;

    return mockProducts.filter((product) =>
      (product.categories ?? []).includes(normalizedCategoryId),
    );
  },

  searchProducts(query: string): Product[] {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return mockProducts;
    }

    return mockProducts.filter((product) =>
      product.title.toLowerCase().includes(normalizedQuery),
    );
  },

  /**
   * Async wrapper.
   * Keeps hooks compatible now and makes API migration easier later.
   */
  async getProducts(): Promise<Product[]> {
    return Promise.resolve(mockProducts);
  },
};