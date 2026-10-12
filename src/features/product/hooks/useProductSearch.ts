import { useCallback, useEffect, useRef, useState } from "react";

import { productService } from "@/features/product/services/product.service";
import type { ProductSearchHit } from "@/features/product/types/storeProduct";
import { hasMoreSearchPages, mergeUniqueHits } from "@/features/product/utils/mergeUniqueHits";

const DEFAULT_SEARCH_LIMIT = 20;

export function useProductSearch(query: string, limit = DEFAULT_SEARCH_LIMIT) {
  const trimmedQuery = query.trim();
  const [items, setItems] = useState<ProductSearchHit[]>([]);
  const [page, setPage] = useState(0);
  const [nbPages, setNbPages] = useState(0);
  const [nbHits, setNbHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const loadMoreLock = useRef(false);
  const pageRef = useRef(0);
  const nbPagesRef = useRef(0);

  const retry = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    pageRef.current = 0;
    nbPagesRef.current = 0;

    if (!trimmedQuery) {
      setItems([]);
      setPage(0);
      setNbPages(0);
      setNbHits(0);
      setError(null);
      setLoading(false);
      return;
    }

    async function loadFirstPage() {
      try {
        setLoading(true);
        setError(null);

        const result = await productService.searchStorePage({
          q: trimmedQuery,
          limit,
          page: 0,
        });

        if (cancelled) {
          return;
        }

        setItems(result.items);
        setPage(result.page);
        setNbPages(result.nbPages);
        setNbHits(result.nbHits);
        pageRef.current = result.page;
        nbPagesRef.current = result.nbPages;
      } catch (e) {
        if (!cancelled) {
          setItems([]);
          setPage(0);
          setNbPages(0);
          setNbHits(0);
          pageRef.current = 0;
          nbPagesRef.current = 0;
          setError(e instanceof Error ? e : new Error("Failed to search products"));
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
  }, [limit, reloadToken, trimmedQuery]);

  const loadMore = useCallback(async () => {
    if (
      !trimmedQuery ||
      loading ||
      loadMoreLock.current ||
      !hasMoreSearchPages(pageRef.current, nbPagesRef.current)
    ) {
      return;
    }

    loadMoreLock.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const result = await productService.searchStorePage({
        q: trimmedQuery,
        limit,
        page: nextPage,
      });
      setItems((current) => mergeUniqueHits(current, result.items));
      setPage(result.page);
      setNbPages(result.nbPages);
      setNbHits(result.nbHits);
      pageRef.current = result.page;
      nbPagesRef.current = result.nbPages;
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to search products"));
    } finally {
      loadMoreLock.current = false;
      setLoadingMore(false);
    }
  }, [limit, loading, trimmedQuery]);

  return {
    items,
    page,
    nbPages,
    nbHits,
    hasMore: hasMoreSearchPages(page, nbPages),
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  };
}
