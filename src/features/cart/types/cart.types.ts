import type { CustomerAddress } from "@/features/address/types/address.types";

export type CartLineItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type DeliveryAddress = CustomerAddress;

export type CartBillLine = {
  id: string;
  label: string;
  amount: number;
  strikethroughAmount?: number;
  tone?: "default" | "discount" | "total";
  indent?: boolean;
};

export type CartBill = {
  mrpTotal: number;
  discountTotal: number;
  discountedValue: number;
  deliveryFee: number;
  deliveryFeeMrp: number;
  platformFee: number;
  amountToPay: number;
  savingsTotal: number;
  lines: CartBillLine[];
};

export type ResolvedCartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mrp: number;
  salePrice: number;
  lineTotal: number;
};
