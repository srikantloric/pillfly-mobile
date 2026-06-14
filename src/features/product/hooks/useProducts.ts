import { useEffect, useState } from "react";

import { productService } from "@/features/product/services/product.service";

import type { Product } from "@/features/product/types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);

        const data = await productService.getProducts();

        if (!cancelled) {
          setProducts(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e : new Error("Failed to load products"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    products,
    loading,
    error,
  };
}