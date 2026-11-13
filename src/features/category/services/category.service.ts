import type { Category } from "@/types/category.types";

import { listCatalogCategories } from "../api/category.api";
import { isRootCatalogCategory, mapCatalogCategory } from "../api/mapCatalogCategory";
import type {
  CatalogCategory,
  CatalogCategoryPagination,
} from "../types/catalogCategory.types";

export type RootCategoriesResult = {
  categories: Category[];
  pagination: CatalogCategoryPagination;
};

const ROOT_PAGE_LIMIT = 100;

let cachedRoot: RootCategoriesResult | null = null;
let rootFetchInFlight: Promise<RootCategoriesResult> | null = null;

export function resetCategoryCache(): void {
  cachedRoot = null;
  rootFetchInFlight = null;
}

function sortRootCategories(a: CatalogCategory, b: CatalogCategory): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.name.localeCompare(b.name);
}

export const categoryService = {
  async getRootCategories(options?: { fresh?: boolean }): Promise<RootCategoriesResult> {
    if (!options?.fresh && cachedRoot) {
      return cachedRoot;
    }

    if (!options?.fresh && rootFetchInFlight) {
      return rootFetchInFlight;
    }

    const request = (async () => {
      const response = await listCatalogCategories({ limit: ROOT_PAGE_LIMIT });
      const roots = response.items.filter(isRootCatalogCategory).slice().sort(sortRootCategories);
      const result: RootCategoriesResult = {
        categories: roots.map(mapCatalogCategory),
        pagination: response.pagination,
      };
      cachedRoot = result;
      return result;
    })();

    rootFetchInFlight = request;
    try {
      return await request;
    } finally {
      if (rootFetchInFlight === request) {
        rootFetchInFlight = null;
      }
    }
  },
};
