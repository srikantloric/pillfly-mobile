import { productService } from "@/features/product/services/product.service";
import { isHealthcareProduct, isMedicineProduct } from "@/features/product/utils/productDisplay";
import type { CartLineItem } from "@/features/cart/types/cart.types";

import type { CreateOrderItemInput } from "../types/order.types";

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function toOrderItems(items: readonly CartLineItem[]): CreateOrderItemInput[] | null {
  if (items.length === 0) {
    return null;
  }

  const orderItems: CreateOrderItemInput[] = [];

  for (const item of items) {
    const product = productService.getProductById(item.productId);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return null;
    }

    if (isHealthcareProduct(product)) {
      const variantId = nonEmpty(item.variantId);
      const variant = variantId
        ? product.variants.find((entry) => entry.id === variantId)
        : undefined;
      const sku = nonEmpty(variant?.sku);
      if (!variantId || !sku) {
        return null;
      }

      orderItems.push({ productId: product.id, variantId, quantity: item.quantity, sku });
      continue;
    }

    if (!isMedicineProduct(product)) {
      return null;
    }

    const sku = nonEmpty(product.sku);
    const productVariantId = nonEmpty(product.variantId);
    const lineVariantId = nonEmpty(item.variantId);
    if (!sku || !productVariantId || (lineVariantId != null && lineVariantId !== productVariantId)) {
      return null;
    }

    orderItems.push({
      productId: product.id,
      variantId: lineVariantId ?? productVariantId,
      quantity: item.quantity,
      sku,
    });
  }

  return orderItems;
}
