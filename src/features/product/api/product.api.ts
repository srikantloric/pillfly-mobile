import { attachAuthInterceptors } from "@/features/auth/api/authInterceptors";
import { productClient } from "@/services/api/product.client";
import { RequestError, toRequestError } from "@/services/api/requestError";

import type {
  ListStoreProductsParams,
  ProductSearchResponse,
  SearchStoreProductsParams,
  StoreProductResponse,
  StoreProductListResponse,
} from "../types/storeProduct";
import {
  parseProductSearchResponse,
  parseStoreProductListResponse,
  parseStoreProductResponse,
} from "./product.parsers";
import { isPublicProductPath, PRODUCT_PATHS } from "./product.paths";

attachAuthInterceptors(productClient, { skipRefresh: isPublicProductPath });

const PRODUCT_STATUS_MESSAGES = {
  400: "Unable to complete this request.",
  404: "Product not found.",
};

const DEFAULT_LIMIT = 20;
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
    throw toRequestError(error, PRODUCT_STATUS_MESSAGES);
  }
}

export async function listStoreProducts(
  params: ListStoreProductsParams = {},
): Promise<StoreProductListResponse> {
  const query: Record<string, string | number> = {
    limit: clampLimit(params.limit),
  };

  if (params.cursor) {
    query.cursor = params.cursor;
  }

  return request(async () => {
    const response = await productClient.get<unknown>(PRODUCT_PATHS.storeList, { params: query });
    return parseStoreProductListResponse(response.data);
  });
}

export async function getStoreProduct(productId: string): Promise<StoreProductResponse> {
  const id = productId.trim();
  if (!id) {
    throw new RequestError("Product id is required.", { status: 400 });
  }

  return request(async () => {
    const response = await productClient.get<unknown>(PRODUCT_PATHS.storeDetail(id));
    return parseStoreProductResponse(response.data);
  });
}

export async function searchStoreProducts(
  params: SearchStoreProductsParams = {},
): Promise<ProductSearchResponse> {
  const page = params.page ?? 0;
  if (!Number.isFinite(page) || page < 0) {
    throw new RequestError("Validation failed", { status: 400 });
  }

  const query: Record<string, string | number> = {
    limit: clampLimit(params.limit),
    page: Math.floor(page),
  };

  if (params.q != null) {
    query.q = params.q.trim();
  }

  return request(async () => {
    const response = await productClient.get<unknown>(PRODUCT_PATHS.search, { params: query });
    return parseProductSearchResponse(response.data);
  });
}
