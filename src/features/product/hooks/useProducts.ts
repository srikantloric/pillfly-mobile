import { useCallback, useEffect, useRef, useState } from "react";

import { productService } from "@/features/product/services/product.service";
import type { Product } from "@/features/product/types/product";
import { mergeUniqueBy } from "@/features/product/utils/mergeUniqueBy";

const DEFAULT_PAGE_LIMIT = 20;

export function useProducts(limit = DEFAULT_PAGE_LIMIT) {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const loadMoreLock = useRef(false);
  const nextCursorRef = useRef<string | undefined>(undefined);

  const retry = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    nextCursorRef.current = undefined;

    async function loadFirstPage() {
      try {
        setLoading(true);
        setError(null);

        const page = await productService.listStorePage({ limit });

        if (cancelled) {
          return;
        }

        setProducts(page.products);
        setNextCursor(page.nextCursor);
        nextCursorRef.current = page.nextCursor;
      } catch (e) {
        if (!cancelled) {
          setProducts([]);
          setNextCursor(undefined);
          nextCursorRef.current = undefined;
          setError(e instanceof Error ? e : new Error("Failed to load products"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [limit, reloadToken]);

  const loadMore = useCallback(async () => {
    const cursor = nextCursorRef.current;
    if (!cursor || loadMoreLock.current || loading) {
      return;
    }

    loadMoreLock.current = true;
    setLoadingMore(true);

    try {
      const page = await productService.listStorePage({ limit, cursor });
      setProducts((current) => mergeUniqueBy(current, page.products, (product) => product.id));
      setNextCursor(page.nextCursor);
      nextCursorRef.current = page.nextCursor;
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load products"));
    } finally {
      loadMoreLock.current = false;
      setLoadingMore(false);
    }
  }, [limit, loading]);

  return {
    products,
    nextCursor,
    hasMore: Boolean(nextCursor),
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  };
}
