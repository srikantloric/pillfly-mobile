import { getStoreProduct, listStoreProducts, searchStoreProducts } from "@/features/product/api/product.api";
import { mapStoreProduct } from "@/features/product/api/mapStoreProduct";
import type { Product } from "@/features/product/types/product";
import type { ProductSearchHit } from "@/features/product/types/storeProduct";
import { mergeUniqueHits } from "@/features/product/utils/mergeUniqueHits";
import { mergeUniqueProducts } from "@/features/product/utils/mergeUniqueProducts";
import { ProductRequestError } from "@/features/product/utils/productRequestError";

export type StoreSearchPage = {
  items: ProductSearchHit[];
  page: number;
  hitsPerPage: number;
  nbHits: number;
  nbPages: number;
};

export type StoreProductPage = {
  products: Product[];
  nextCursor?: string;
};

const productCache = new Map<string, Product>();
const productFetchInFlight = new Map<string, Promise<Product | undefined>>();

function remember(product: Product): Product {
  productCache.set(product.id, product);
  return product;
}

export function resetProductCache(): void {
  productCache.clear();
  productFetchInFlight.clear();
}

export const productService = {
  getAllProducts(): Product[] {
    return Array.from(productCache.values());
  },

  getProductById(id: string): Product | undefined {
    return productCache.get(id);
  },

  async fetchProductById(id: string): Promise<Product | undefined> {
    const cached = productCache.get(id);
    if (cached) {
      return cached;
    }

    const pending = productFetchInFlight.get(id);
    if (pending) {
      return pending;
    }

    const request = (async () => {
      try {
        const response = await getStoreProduct(id);
        return remember(mapStoreProduct(response.data));
      } catch (error) {
        if (error instanceof ProductRequestError && error.status === 404) {
          return undefined;
        }

        throw error;
      }
    })();

    productFetchInFlight.set(id, request);

    try {
      return await request;
    } finally {
      productFetchInFlight.delete(id);
    }
  },

  async ensureProductsByIds(ids: readonly string[]): Promise<void> {
    const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0))];

    await Promise.all(
      uniqueIds.map(async (id) => {
        if (productCache.has(id)) {
          return;
        }

        try {
          await productService.fetchProductById(id);
        } catch {
          // Leave the id unresolved so cart can render what it has and retry later.
        }
      }),
    );
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

  async searchStorePage(params: { q: string; limit?: number; page?: number }): Promise<StoreSearchPage> {
    const response = await searchStoreProducts({
      q: params.q,
      limit: params.limit,
      page: params.page ?? 0,
    });

    return {
      items: mergeUniqueHits([], response.items),
      page: response.page,
      hitsPerPage: response.hitsPerPage,
      nbHits: response.nbHits,
      nbPages: response.nbPages,
    };
  },

  async listStorePage(params: { limit?: number; cursor?: string } = {}): Promise<StoreProductPage> {
    const cursor = params.cursor?.trim();
    const response = await listStoreProducts({
      limit: params.limit,
      cursor: cursor || undefined,
    });

    const products = mergeUniqueProducts(
      [],
      response.data.map((product) => remember(mapStoreProduct(product))),
    );

    const page: StoreProductPage = { products };
    if (response.nextCursor) {
      page.nextCursor = response.nextCursor;
    }

    return page;
  },

  async getProducts(): Promise<Product[]> {
    const page = await productService.listStorePage();
    return page.products;
  },
};
