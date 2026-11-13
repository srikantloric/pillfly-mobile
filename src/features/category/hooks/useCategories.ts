import { useCallback, useEffect, useState } from "react";

import type { Category } from "@/types/category.types";

import { categoryService } from "../services/category.service";
import type { CatalogCategoryPagination } from "../types/catalogCategory.types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<CatalogCategoryPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await categoryService.getRootCategories({
          fresh: reloadToken > 0,
        });

        if (cancelled) {
          return;
        }

        setCategories(result.categories);
        setPagination(result.pagination);
      } catch (e) {
        if (!cancelled) {
          setCategories([]);
          setPagination(null);
          setError(e instanceof Error ? e : new Error("Failed to load categories"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return {
    categories,
    pagination,
    hasMore: Boolean(pagination?.hasMore && pagination.nextCursor),
    loading,
    error,
    retry,
  };
}
