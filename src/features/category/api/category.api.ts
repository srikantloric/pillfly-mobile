import "@/features/product/api/product.api";

import { productClient } from "@/services/api/product.client";
import { toRequestError } from "@/services/api/requestError";

import type {
  CatalogCategoryList,
  ListCatalogCategoriesParams,
} from "../types/catalogCategory.types";
import { parseCatalogCategoryListResponse } from "./category.parsers";
import { CATEGORY_PATHS } from "./category.paths";

const CATEGORY_STATUS_MESSAGES = {
  400: "Unable to complete this request.",
  404: "Categories not found.",
};

const DEFAULT_LIMIT = 100;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

function clampLimit(limit: number | undefined): number {
  const value = limit ?? DEFAULT_LIMIT;
  if (!Number.isFinite(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(value)));
}

async function request<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toRequestError(error, CATEGORY_STATUS_MESSAGES);
  }
}

export async function listCatalogCategories(
  params: ListCatalogCategoriesParams = {},
): Promise<CatalogCategoryList> {
  const query: Record<string, string | number> = {
    limit: clampLimit(params.limit),
  };

  const cursor = params.cursor?.trim();
  if (cursor) {
    query.cursor = cursor;
  }

  return request(async () => {
    const response = await productClient.get<unknown>(CATEGORY_PATHS.collection, { params: query });
    return parseCatalogCategoryListResponse(response.data);
  });
}
