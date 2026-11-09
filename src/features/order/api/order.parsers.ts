import { parseCustomerAddress } from "@/features/address/api/address.parsers";
import { RequestError } from "@/services/api/requestError";

import {
  isOrderStatus,
  isPaymentStatus,
  isRefundStatus,
  type CancelOrderResponse,
  type CreateOrderInput,
  type CreateOrderResponse,
  type CustomerOrder,
  type CustomerOrderList,
  type OrderItem,
  type OrderPayment,
  type OrderPricing,
  type OrderPricingItem,
  type OrderRefund,
  type OrderShippingAddress,
  type RefundOrderResponse,
  type VerifyPaymentInput,
  type VerifyPaymentResponse,
} from "../types/order.types";

const MAX_ORDER_ITEMS = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalString(value: unknown): string | undefined | null {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requiredNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function optionalNumber(value: unknown): number | undefined | null {
  if (value == null) {
    return undefined;
  }

  return requiredNumber(value);
}

function requiredInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  return value;
}

function malformed(): RequestError {
  return new RequestError("Unexpected response from server.", { kind: "malformed" });
}

function invalidItem(): RequestError {
  return new RequestError("Each item needs a product, variant, SKU, and a quantity of at least 1.", {
    status: 400,
  });
}

function parseOrderItem(value: unknown): OrderItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const productId = requiredString(value.productId);
  const variantId = requiredString(value.variantId);
  const title = requiredString(value.title);
  const sku = requiredString(value.sku);
  const quantity = requiredInteger(value.quantity);
  const mrp = requiredNumber(value.mrp);
  const sellingDiscount = requiredNumber(value.sellingDiscount);
  const unitPrice = requiredNumber(value.unitPrice);
  const totalPrice = requiredNumber(value.totalPrice);

  if (
    !productId ||
    !variantId ||
    !title ||
    !sku ||
    quantity === null ||
    mrp === null ||
    sellingDiscount === null ||
    unitPrice === null ||
    totalPrice === null
  ) {
    return null;
  }

  return {
    productId,
    variantId,
    title,
    sku,
    quantity,
    mrp,
    sellingDiscount,
    unitPrice,
    totalPrice,
  };
}

function parseShippingAddress(value: unknown): OrderShippingAddress | null {
  if (!isRecord(value)) {
    return null;
  }

  const addressId = requiredString(value.addressId);
  const recipientName = requiredString(value.recipientName);
  const phoneNumber = requiredString(value.phoneNumber);
  const addressLine1 = requiredString(value.addressLine1);
  const addressLine2 = optionalString(value.addressLine2);
  const landmark = optionalString(value.landmark);
  const city = requiredString(value.city);
  const state = requiredString(value.state);
  const postalCode = requiredString(value.postalCode);
  const countryCode = requiredString(value.countryCode);

  if (
    !addressId ||
    !recipientName ||
    !phoneNumber ||
    !addressLine1 ||
    addressLine2 === null ||
    landmark === null ||
    !city ||
    !state ||
    !postalCode ||
    countryCode !== "IN"
  ) {
    return null;
  }

  return {
    addressId,
    recipientName,
    phoneNumber,
    addressLine1,
    ...(addressLine2 ? { addressLine2 } : {}),
    ...(landmark ? { landmark } : {}),
    city,
    state,
    postalCode,
    countryCode,
  };
}

export function parseCustomerOrder(value: unknown): CustomerOrder | null {
  if (!isRecord(value) || !Array.isArray(value.items) || !isOrderStatus(value.status)) {
    return null;
  }

  if (!isPaymentStatus(value.paymentStatus) || value.currency !== "INR") {
    return null;
  }

  const id = requiredString(value.id);
  const customerId = requiredString(value.customerId);
  const subtotal = requiredNumber(value.subtotal);
  const totalAmount = requiredNumber(value.totalAmount);
  const createdAt = requiredString(value.createdAt);
  const updatedAt = requiredString(value.updatedAt);
  const shippingAddress = parseShippingAddress(value.shippingAddress);
  const razorpayOrderId = optionalString(value.razorpayOrderId);
  const razorpayPaymentId = optionalString(value.razorpayPaymentId);
  const razorpayRefundId = optionalString(value.razorpayRefundId);
  const refundAmount = optionalNumber(value.refundAmount);
  const items = value.items.map(parseOrderItem);

  if (
    !id ||
    !customerId ||
    subtotal === null ||
    totalAmount === null ||
    !createdAt ||
    !updatedAt ||
    !shippingAddress ||
    razorpayOrderId === null ||
    razorpayPaymentId === null ||
    razorpayRefundId === null ||
    refundAmount === null ||
    items.some((item) => item == null)
  ) {
    return null;
  }

  return {
    id,
    customerId,
    items: items as OrderItem[],
    subtotal,
    totalAmount,
    currency: "INR",
    status: value.status,
    paymentStatus: value.paymentStatus,
    shippingAddress,
    createdAt,
    updatedAt,
    ...(razorpayOrderId ? { razorpayOrderId } : {}),
    ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
    ...(razorpayRefundId ? { razorpayRefundId } : {}),
    ...(refundAmount !== undefined ? { refundAmount } : {}),
  };
}

function readNextCursor(data: Record<string, unknown>): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(data, "nextCursor") || data.nextCursor == null) {
    return undefined;
  }

  if (typeof data.nextCursor !== "string") {
    throw malformed();
  }

  const trimmed = data.nextCursor.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseCustomerOrderListResponse(data: unknown): CustomerOrderList {
  if (!isRecord(data) || data.success !== true || !Array.isArray(data.data)) {
    throw malformed();
  }

  const response: CustomerOrderList = {
    data: data.data
      .map((item) => parseCustomerOrder(item))
      .filter((item): item is CustomerOrder => item != null),
  };
  const nextCursor = readNextCursor(data);
  if (nextCursor) {
    response.nextCursor = nextCursor;
  }

  return response;
}

function parseOrderPricing(value: unknown): OrderPricing | null {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return null;
  }

  const subtotal = requiredNumber(value.subtotal);
  const items = value.items.map((item) => {
    const orderItem = parseOrderItem(item);
    if (!orderItem || !isRecord(item)) {
      return null;
    }

    const availableQty = requiredNumber(item.availableQty);
    if (availableQty === null) {
      return null;
    }

    const pricingItem: OrderPricingItem = { ...orderItem, availableQty };
    return pricingItem;
  });

  if (subtotal === null || items.some((item) => item == null)) {
    return null;
  }

  return { items: items as OrderPricingItem[], subtotal };
}

function parseOrderPayment(value: unknown): OrderPayment | null {
  if (!isRecord(value)) {
    return null;
  }

  const razorpayOrderId = requiredString(value.razorpayOrderId);
  const amount = requiredNumber(value.amount);
  const currency = requiredString(value.currency);

  if (!razorpayOrderId || amount === null || !currency) {
    return null;
  }

  return { razorpayOrderId, amount, currency };
}

export function parseCreateOrderResponse(data: unknown): CreateOrderResponse {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }

  const message = requiredString(data.message);
  const customerId = requiredString(data.customerId);
  const address = parseCustomerAddress(data.address);
  const pricing = parseOrderPricing(data.pricing);
  const order = parseCustomerOrder(data.order);
  const payment = parseOrderPayment(data.payment);

  if (
    !message ||
    !customerId ||
    !address ||
    address.countryCode !== "IN" ||
    !pricing ||
    !order ||
    !payment
  ) {
    throw malformed();
  }

  return { message, customerId, address, pricing, order, payment };
}

export function parseCustomerOrderResponse(data: unknown): CustomerOrder {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }

  const order = parseCustomerOrder(data.data);
  if (!order) {
    throw malformed();
  }

  return order;
}

export function parseVerifyPaymentResponse(data: unknown): VerifyPaymentResponse {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }

  const message = requiredString(data.message);
  const order = parseCustomerOrder(data.order);
  if (!message || !order) {
    throw malformed();
  }

  return { message, order };
}

export function parseCancelOrderResponse(data: unknown): CancelOrderResponse {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }

  const message = requiredString(data.message);
  const order = parseCustomerOrder(data.data);
  if (!message || !order) {
    throw malformed();
  }

  return { message, order };
}

function parseOrderRefund(value: unknown): OrderRefund | null {
  if (!isRecord(value) || !isRefundStatus(value.status)) {
    return null;
  }

  const id = requiredString(value.id);
  const amount = requiredNumber(value.amount);
  const currency = requiredString(value.currency);
  const paymentId = requiredString(value.paymentId);

  if (!id || amount === null || !currency || !paymentId) {
    return null;
  }

  return { id, status: value.status, amount, currency, paymentId };
}

export function parseRefundOrderResponse(data: unknown): RefundOrderResponse {
  if (!isRecord(data) || data.success !== true || !isRecord(data.data)) {
    throw malformed();
  }

  const message = requiredString(data.message);
  const order = parseCustomerOrder(data.data.order);
  const refund = parseOrderRefund(data.data.refund);

  if (!message || !order || !refund) {
    throw malformed();
  }

  return { message, order, refund };
}

export function toCreateOrderBody(input: CreateOrderInput): CreateOrderInput {
  const addressId = requiredString(input?.addressId);
  if (!addressId) {
    throw new RequestError("A delivery address is required.", { status: 400 });
  }

  if (!Array.isArray(input.items) || input.items.length < 1) {
    throw new RequestError("Add at least one item.", { status: 400 });
  }

  if (input.items.length > MAX_ORDER_ITEMS) {
    throw new RequestError("An order can include at most 50 items.", { status: 400 });
  }

  return {
    addressId,
    items: input.items.map((item) => {
      if (!isRecord(item)) {
        throw invalidItem();
      }

      const productId = requiredString(item.productId);
      const variantId = requiredString(item.variantId);
      const sku = requiredString(item.sku);
      const quantity = requiredInteger(item.quantity);

      if (!productId || !variantId || !sku || quantity === null || quantity < 1) {
        throw invalidItem();
      }

      return { productId, variantId, quantity, sku };
    }),
  };
}

export function toVerifyPaymentBody(input: VerifyPaymentInput): VerifyPaymentInput {
  const razorpayOrderId = requiredString(input?.razorpayOrderId);
  const razorpayPaymentId = requiredString(input?.razorpayPaymentId);
  const razorpaySignature = requiredString(input?.razorpaySignature);

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new RequestError("Payment details are incomplete.", { status: 400 });
  }

  return { razorpayOrderId, razorpayPaymentId, razorpaySignature };
}
