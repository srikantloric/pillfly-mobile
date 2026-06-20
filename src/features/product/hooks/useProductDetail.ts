import { useEffect, useState } from "react";

import { productService } from "@/features/product/services/product.service";
import type { Product } from "@/features/product/types/product";

export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<Product | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setProduct(undefined);

    async function loadProduct() {
      try {
        const loaded = await productService.fetchProductById(productId);

        if (cancelled) {
          return;
        }

        if (loaded) {
          setProduct(loaded);
        } else {
          setError(new Error(`Product not found: ${productId}`));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error("Failed to load product"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, loading, error };
}
