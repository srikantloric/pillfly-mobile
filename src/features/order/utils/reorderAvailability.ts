import "@/features/product/api/product.api";

import { parseStoreProductResponse } from "@/features/product/api/product.parsers";
import { PRODUCT_PATHS } from "@/features/product/api/product.paths";
import type { StoreProduct } from "@/features/product/types/storeProduct";
import { productClient } from "@/services/api/product.client";
import { RequestError, toRequestError } from "@/services/api/requestError";

export type ReorderLine = {
  productId: string;
  variantId: string;
  title: string;
  quantity: number;
};

export type ReorderCartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type ReorderProductResult =
  | { kind: "active"; product: StoreProduct }
  | { kind: "missing" }
  | { kind: "inactive" }
  | { kind: "unknown" };

export type ReorderAddition = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type ReorderPlan = {
  additions: ReorderAddition[];
  notices: string[];
  openCart: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function groupLines(items: readonly ReorderLine[]): ReorderLine[] {
  const groups = new Map<string, ReorderLine>();

  for (const item of items) {
    const key = `${item.productId}\n${item.variantId}`;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }

    groups.set(key, { ...item });
  }

  return [...groups.values()];
}

function cartHas(cartItems: readonly ReorderCartLine[], productId: string, variantId: string): boolean {
  return cartItems.some((item) => item.productId === productId && item.variantId === variantId);
}

export async function loadReorderProduct(productId: string): Promise<ReorderProductResult> {
  try {
    const response = await productClient.get<unknown>(PRODUCT_PATHS.storeDetail(productId));
    const body = response.data;
    const product = isRecord(body) && isRecord(body.data) ? body.data : null;
    if (product && typeof product.status === "string" && product.status !== "ACTIVE") {
      return { kind: "inactive" };
    }

    return { kind: "active", product: parseStoreProductResponse(body).data };
  } catch (error) {
    const requestError = error instanceof RequestError ? error : toRequestError(error, { 404: "Product not found." });
    if (requestError.status === 404) {
      return { kind: "missing" };
    }

    return { kind: "unknown" };
  }
}

export function planReorder(
  items: readonly ReorderLine[],
  cartItems: readonly ReorderCartLine[],
  products: ReadonlyMap<string, ReorderProductResult>,
): ReorderPlan {
  const notices: string[] = [];
  const additions: ReorderAddition[] = [];
  let kept = false;

  for (const line of groupLines(items)) {
    if (line.quantity < 1) {
      continue;
    }

    if (cartHas(cartItems, line.productId, line.variantId)) {
      kept = true;
      continue;
    }

    const result = products.get(line.productId);
    if (!result || result.kind === "unknown") {
      notices.push(`Couldn't check ${line.title}. It was not added.`);
      continue;
    }

    if (result.kind === "missing" || result.kind === "inactive") {
      notices.push(`${line.title} is no longer available.`);
      continue;
    }

    const variant = result.product.variants.find((item) => item.id === line.variantId);
    if (!variant || variant.status !== "ACTIVE") {
      notices.push(`${line.title} is no longer available in that option.`);
      continue;
    }

    const stock = Math.floor(variant.availableQty);
    if (!variant.inStock || stock <= 0) {
      notices.push(`${line.title} is out of stock.`);
      continue;
    }

    const quantity = Math.min(line.quantity, stock);
    additions.push({ productId: line.productId, variantId: line.variantId, quantity });
    if (quantity < line.quantity) {
      notices.push(`Only ${quantity} of ${line.title} was added.`);
    }
  }

  return {
    additions,
    notices,
    openCart: kept || additions.length > 0,
  };
}

export async function prepareReorder(
  items: readonly ReorderLine[],
  cartItems: readonly ReorderCartLine[],
): Promise<ReorderPlan> {
  const pendingIds = [
    ...new Set(
      groupLines(items)
        .filter((line) => line.quantity >= 1 && !cartHas(cartItems, line.productId, line.variantId))
        .map((line) => line.productId),
    ),
  ];
  const products = new Map<string, ReorderProductResult>();

  await Promise.all(
    pendingIds.map(async (productId) => {
      products.set(productId, await loadReorderProduct(productId));
    }),
  );

  return planReorder(items, cartItems, products);
}
