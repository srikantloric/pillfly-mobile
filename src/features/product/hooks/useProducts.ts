import { useCallback, useEffect, useRef, useState } from "react";

import { productLog } from "@/features/product/api/productLog";
import { productService } from "@/features/product/services/product.service";
import type { Product } from "@/features/product/types/product";
import { mergeUniqueBy } from "@/features/product/utils/mergeUniqueBy";
import { RequestError } from "@/services/api/requestError";

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
    productLog("list.retry");
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    nextCursorRef.current = undefined;

    async function loadFirstPage() {
      productLog("list.first.start", { limit });
      try {
        setLoading(true);
        setError(null);

        const page = await productService.listStorePage({ limit });

        if (cancelled) {
          productLog("list.first.cancelled");
          return;
        }

        setProducts(page.products);
        setNextCursor(page.nextCursor);
        nextCursorRef.current = page.nextCursor;
        productLog("list.first.ok", {
          count: page.products.length,
          ids: page.products.map((product) => product.id),
          hasNextCursor: Boolean(page.nextCursor),
        });
      } catch (e) {
        if (!cancelled) {
          setProducts([]);
          setNextCursor(undefined);
          nextCursorRef.current = undefined;
          setError(e instanceof Error ? e : new Error("Failed to load products"));
          productLog("list.first.fail", describeProductError(e));
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
      productLog("list.more.skip", {
        hasCursor: Boolean(cursor),
        busy: loadMoreLock.current || loading,
      });
      return;
    }

    loadMoreLock.current = true;
    setLoadingMore(true);
    productLog("list.more.start", { limit, cursorLength: cursor.length });

    try {
      const page = await productService.listStorePage({ limit, cursor });
      let total = 0;
      setProducts((current) => {
        const merged = mergeUniqueBy(current, page.products, (product) => product.id);
        total = merged.length;
        return merged;
      });
      productLog("list.more.ok", {
        received: page.products.length,
        total,
        hasNextCursor: Boolean(page.nextCursor),
      });
      setNextCursor(page.nextCursor);
      nextCursorRef.current = page.nextCursor;
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load products"));
      productLog("list.more.fail", describeProductError(e));
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

function describeProductError(error: unknown): Record<string, unknown> {
  if (error instanceof RequestError) {
    return { message: error.message, status: error.status, kind: error.kind };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unknown error" };
}
