import { useCallback, useEffect, useRef, useState } from "react";

import { productService } from "@/features/product/services/product.service";
import type { ProductSearchHit } from "@/features/product/types/storeProduct";
import { mergeUniqueBy } from "@/features/product/utils/mergeUniqueBy";

const DEFAULT_SEARCH_LIMIT = 20;

/** `page` is 0-based; `nbPages` is the total page count. */
export function hasMoreSearchPages(page: number, nbPages: number): boolean {
  return nbPages > 0 && page < nbPages - 1;
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error("Failed to search products");
}

export function useProductSearch(query: string, limit = DEFAULT_SEARCH_LIMIT) {
  const trimmedQuery = query.trim();
  const [items, setItems] = useState<ProductSearchHit[]>([]);
  // The query `items` belong to; differs from `trimmedQuery` until that query's first page settles.
  const [resultQuery, setResultQuery] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Paging cursor for loadMore; `generation` changes with each new query so late pages are dropped.
  const paging = useRef({ page: 0, nbPages: 0, generation: 0, loadingMore: false });

  const retry = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    const generation = paging.current.generation + 1;
    paging.current = { page: 0, nbPages: 0, generation, loadingMore: false };
    setError(null);
    setLoadingMore(false);

    if (!trimmedQuery) {
      setItems([]);
      setResultQuery("");
      setHasMore(false);
      setLoading(false);
      return;
    }

    // Previous results stay visible until the new query's first page arrives.

    setLoading(true);
    productService
      .searchStorePage({ q: trimmedQuery, limit, page: 0 })
      .then((result) => {
        if (paging.current.generation !== generation) {
          return;
        }
        paging.current.page = result.page;
        paging.current.nbPages = result.nbPages;
        setItems(result.items);
        setResultQuery(trimmedQuery);
        setHasMore(hasMoreSearchPages(result.page, result.nbPages));
      })
      .catch((e: unknown) => {
        if (paging.current.generation === generation) {
          setItems([]);
          setResultQuery(trimmedQuery);
          setHasMore(false);
          setError(toError(e));
        }
      })
      .finally(() => {
        if (paging.current.generation === generation) {
          setLoading(false);
        }
      });
  }, [limit, reloadToken, trimmedQuery]);

  const loadMore = useCallback(async () => {
    const state = paging.current;
    if (!trimmedQuery || loading || state.loadingMore || !hasMoreSearchPages(state.page, state.nbPages)) {
      return;
    }

    const { generation } = state;
    state.loadingMore = true;
    setLoadingMore(true);

    try {
      const result = await productService.searchStorePage({
        q: trimmedQuery,
        limit,
        page: state.page + 1,
      });
      if (paging.current.generation !== generation) {
        return;
      }
      paging.current.page = result.page;
      paging.current.nbPages = result.nbPages;
      setItems((current) => mergeUniqueBy(current, result.items, (hit) => hit.productId));
      setHasMore(hasMoreSearchPages(result.page, result.nbPages));
      setError(null);
    } catch (e) {
      if (paging.current.generation === generation) {
        setError(toError(e));
      }
    } finally {
      if (paging.current.generation === generation) {
        paging.current.loadingMore = false;
        setLoadingMore(false);
      }
    }
  }, [limit, loading, trimmedQuery]);

  return { items, resultQuery, hasMore, loading, loadingMore, error, loadMore, retry };
}
