import type { CustomerAddress } from "@/features/address/types/address.types";

export const ORDER_STATUSES = [
  "PAYMENT_PENDING",
  "PAYMENT_PROCESSING",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUND_PENDING",
  "REFUNDED",
] as const;

export const PAYMENT_STATUSES = ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"] as const;

export const REFUND_STATUSES = ["processed", "pending", "failed"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type RefundStatus = (typeof REFUND_STATUSES)[number];
export type OrderSortOrder = "asc" | "desc";

export type OrderItem = {
  productId: string;
  variantId: string;
  title: string;
  sku: string;
  quantity: number;
  mrp: number;
  sellingDiscount: number;
  unitPrice: number;
  totalPrice: number;
};

export type OrderShippingAddress = {
  addressId: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: "IN";
};

export type CustomerOrder = {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  currency: "INR";
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: OrderShippingAddress;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayRefundId?: string;
  refundAmount?: number;
};

export type OrderPricingItem = OrderItem & {
  availableQty: number;
};

export type OrderPricing = {
  items: OrderPricingItem[];
  subtotal: number;
};

export type OrderPayment = {
  razorpayOrderId: string;
  amount: number;
  currency: string;
};

export type CreateOrderItemInput = {
  productId: string;
  variantId: string;
  quantity: number;
  sku: string;
};

export type CreateOrderInput = {
  addressId: string;
  items: CreateOrderItemInput[];
};

export type CreateOrderResponse = {
  message: string;
  customerId: string;
  address: CustomerAddress;
  pricing: OrderPricing;
  order: CustomerOrder;
  payment: OrderPayment;
};

export type CustomerOrderList = {
  data: CustomerOrder[];
  nextCursor?: string;
};

export type ListCustomerOrdersParams = {
  limit?: number;
  cursor?: string;
  sortOrder?: OrderSortOrder;
};

export type VerifyPaymentInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type VerifyPaymentResponse = {
  message: string;
  order: CustomerOrder;
};

export type CancelOrderResponse = {
  message: string;
  order: CustomerOrder;
};

export type OrderRefund = {
  id: string;
  status: RefundStatus;
  amount: number;
  currency: string;
  paymentId: string;
};

export type RefundOrderResponse = {
  message: string;
  order: CustomerOrder;
  refund: OrderRefund;
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === "string" && (PAYMENT_STATUSES as readonly string[]).includes(value);
}

export function isRefundStatus(value: unknown): value is RefundStatus {
  return typeof value === "string" && (REFUND_STATUSES as readonly string[]).includes(value);
}

export function isOrderSortOrder(value: unknown): value is OrderSortOrder {
  return value === "asc" || value === "desc";
}
