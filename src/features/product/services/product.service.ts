import { getStoreProduct, listStoreProducts, searchStoreProducts } from "@/features/product/api/product.api";
import { mapStoreProduct } from "@/features/product/api/mapStoreProduct";
import type { Product } from "@/features/product/types/product";
import type { ProductSearchResponse } from "@/features/product/types/storeProduct";
import { mergeUniqueBy } from "@/features/product/utils/mergeUniqueBy";
import { RequestError } from "@/services/api/requestError";

export type StoreProductPage = {
  products: Product[];
  nextCursor?: string;
};

/**
 * Products fetched from the API are cached by id so the cart and detail screens can
 * read them synchronously; concurrent fetches of the same id share one request.
 */
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
  getProductById(id: string): Product | undefined {
    return productCache.get(id);
  },

  /** Resolves `undefined` when the product does not exist (404). */
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
        if (error instanceof RequestError && error.status === 404) {
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
        try {
          await productService.fetchProductById(id);
        } catch {
          // Leave the id unresolved so cart can render what it has and retry later.
        }
      }),
    );
  },

  /** Search can return several records per product; keep one hit per product id. */
  async searchStorePage(params: { q: string; limit?: number; page?: number }): Promise<ProductSearchResponse> {
    const response = await searchStoreProducts({ q: params.q, limit: params.limit, page: params.page ?? 0 });
    return { ...response, items: mergeUniqueBy([], response.items, (hit) => hit.productId) };
  },

  async listStorePage(params: { limit?: number; cursor?: string } = {}): Promise<StoreProductPage> {
    const response = await listStoreProducts({ limit: params.limit, cursor: params.cursor });
    const products = mergeUniqueBy(
      [],
      response.data.map((product) => remember(mapStoreProduct(product))),
      (product) => product.id,
    );

    return response.nextCursor ? { products, nextCursor: response.nextCursor } : { products };
  },
};
