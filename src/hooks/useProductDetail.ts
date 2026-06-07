import { useEffect, useState } from "react";

import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<Product | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const loaded = productService.getProductById(productId);

    if (!cancelled) {
      if (loaded) {
        setProduct(loaded);
      } else {
        setError(new Error(`Product not found: ${productId}`));
      }
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, loading, error };
}
