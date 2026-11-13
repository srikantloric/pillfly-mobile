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
import { productLog } from "./productLog";
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
    productLog("storeList.start", {
      limit: query.limit,
      hasCursor: typeof query.cursor === "string",
      cursorLength: typeof query.cursor === "string" ? query.cursor.length : 0,
    });

    try {
      const response = await productClient.get<unknown>(PRODUCT_PATHS.storeList, { params: query });
      productLog("storeList.response", summarizeStoreListBody(response.data));
      const parsed = parseStoreProductListResponse(response.data);
      productLog("storeList.ok", {
        count: parsed.data.length,
        ids: parsed.data.map((product) => product.id),
        productTypes: parsed.data.map((product) => product.productType),
        hasNextCursor: Boolean(parsed.nextCursor),
        nextCursorLength: parsed.nextCursor?.length ?? 0,
      });
      return parsed;
    } catch (error) {
      productLog("storeList.fail", {
        message: error instanceof Error ? error.message : "Unknown error",
        status: error instanceof RequestError ? error.status : undefined,
        kind: error instanceof RequestError ? error.kind : undefined,
      });
      throw error;
    }
  });
}

function summarizeStoreListBody(data: unknown): Record<string, unknown> {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { body: typeof data };
  }

  const body = data as Record<string, unknown>;
  const payload =
    typeof body.data === "object" && body.data !== null && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : undefined;
  const items = payload && Array.isArray(payload.items) ? payload.items : undefined;
  const pagination =
    payload &&
    typeof payload.pagination === "object" &&
    payload.pagination !== null &&
    !Array.isArray(payload.pagination)
      ? (payload.pagination as Record<string, unknown>)
      : undefined;
  const nextCursor = pagination ? pagination.nextCursor : undefined;

  return {
    success: body.success,
    itemCount: items?.length,
    paginationKeys: pagination ? Object.keys(pagination) : undefined,
    nextCursor:
      nextCursor == null
        ? nextCursor
        : typeof nextCursor === "string"
          ? `string(${nextCursor.length})`
          : typeof nextCursor,
    hasMore: pagination?.hasMore,
    hitsPerPage: pagination?.hitsPerPage,
  };
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
