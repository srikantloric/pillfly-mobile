import { productService } from "@/features/product/services/product.service";
import {
  formatInr,
  getProductImageUrl,
  getProductPackLabel,
  getProductPricing,
} from "@/features/product/utils/productDisplay";

import {
  DELIVERY_FEE,
  DELIVERY_FEE_MRP,
  FREE_DELIVERY_MRP_THRESHOLD,
  PLATFORM_FEE,
} from "../mocks/cartFees.mock";
import type { CartBill, CartLineItem, ResolvedCartLine } from "../types/cart.types";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resolveCartLines(items: readonly CartLineItem[]): ResolvedCartLine[] {
  const lines: ResolvedCartLine[] = [];

  for (const item of items) {
    const product = productService.getProductById(item.productId);
    const pricing = product ? getProductPricing(product) : null;

    if (!product || !pricing) {
      continue;
    }

    lines.push({
      productId: item.productId,
      quantity: item.quantity,
      title: product.title,
      subtitle: getProductPackLabel(product),
      imageUrl: getProductImageUrl(product),
      mrp: pricing.mrp,
      salePrice: pricing.salePrice,
      lineTotal: roundMoney(pricing.salePrice * item.quantity),
    });
  }

  return lines;
}

export function buildCartBill(items: readonly CartLineItem[]): CartBill | null {
  const resolved = resolveCartLines(items);

  if (resolved.length === 0) {
    return null;
  }

  const mrpTotal = roundMoney(
    resolved.reduce((sum, line) => sum + line.mrp * line.quantity, 0),
  );
  const discountedValue = roundMoney(
    resolved.reduce((sum, line) => sum + line.lineTotal, 0),
  );
  const discountTotal = roundMoney(mrpTotal - discountedValue);

  const deliveryFee = mrpTotal >= FREE_DELIVERY_MRP_THRESHOLD ? 0 : DELIVERY_FEE;
  const deliveryFeeMrp = mrpTotal >= FREE_DELIVERY_MRP_THRESHOLD ? 0 : DELIVERY_FEE_MRP;
  const platformFee = PLATFORM_FEE;
  const amountToPay = roundMoney(discountedValue + deliveryFee + platformFee);
  const savingsTotal = roundMoney(discountTotal + (deliveryFeeMrp - deliveryFee));

  const lines: CartBill["lines"] = [
    { id: "mrp", label: "MRP", amount: mrpTotal, tone: "default" },
    {
      id: "discount",
      label: "Discount",
      amount: -discountTotal,
      tone: "discount",
    },
    { id: "discounted", label: "Discounted Value", amount: discountedValue, tone: "default" },
    {
      id: "delivery",
      label: "Delivery Fee",
      amount: deliveryFee,
      strikethroughAmount: deliveryFeeMrp > deliveryFee ? deliveryFeeMrp : undefined,
      tone: "default",
    },
    { id: "platform", label: "Platform Fee", amount: platformFee, tone: "default" },
    {
      id: "total",
      label: "Amount to be paid",
      amount: amountToPay,
      tone: "total",
    },
  ];

  return {
    mrpTotal,
    discountTotal,
    discountedValue,
    deliveryFee,
    deliveryFeeMrp,
    platformFee,
    amountToPay,
    savingsTotal,
    lines,
  };
}

export function formatCartTotal(amount: number): string {
  return formatInr(amount);
}

export function getCartItemCount(items: readonly CartLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
