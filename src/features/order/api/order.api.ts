import "@/features/product/api/product.api";

import { productClient } from "@/services/api/product.client";
import { RequestError, toRequestError } from "@/services/api/requestError";

import { isOrderSortOrder } from "../types/order.types";
import type {
  CancelOrderResponse,
  CreateOrderInput,
  CreateOrderResponse,
  CustomerOrder,
  CustomerOrderList,
  ListCustomerOrdersParams,
  RefundOrderResponse,
  VerifyPaymentInput,
  VerifyPaymentResponse,
} from "../types/order.types";
import {
  parseCancelOrderResponse,
  parseCreateOrderResponse,
  parseCustomerOrderListResponse,
  parseCustomerOrderResponse,
  parseRefundOrderResponse,
  parseVerifyPaymentResponse,
  toCreateOrderBody,
  toVerifyPaymentBody,
} from "./order.parsers";
import { ORDER_PATHS } from "./order.paths";

const ORDER_STATUS_MESSAGES = {
  400: "Unable to complete this order request.",
  401: "Please sign in again.",
  404: "Order not found.",
};

const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_SORT_ORDER = "desc";

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
    throw toRequestError(error, ORDER_STATUS_MESSAGES);
  }
}

function requireOrderId(orderId: string): string {
  const id = orderId.trim();
  if (!id) {
    throw new RequestError("Order id is required.", { status: 400 });
  }

  return id;
}

export async function listCustomerOrders(
  params: ListCustomerOrdersParams = {},
): Promise<CustomerOrderList> {
  const query: Record<string, string | number> = {
    limit: clampLimit(params.limit),
    sortOrder: isOrderSortOrder(params.sortOrder) ? params.sortOrder : DEFAULT_SORT_ORDER,
  };
  const cursor = params.cursor?.trim();
  if (cursor) {
    query.cursor = cursor;
  }

  return request(async () => {
    const response = await productClient.get<unknown>(ORDER_PATHS.collection, { params: query });
    return parseCustomerOrderListResponse(response.data);
  });
}

export async function createCustomerOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
  const body = toCreateOrderBody(input);

  return request(async () => {
    const response = await productClient.post<unknown>(ORDER_PATHS.collection, body);
    return parseCreateOrderResponse(response.data);
  });
}

export async function getCustomerOrder(orderId: string): Promise<CustomerOrder> {
  const id = requireOrderId(orderId);

  return request(async () => {
    const response = await productClient.get<unknown>(ORDER_PATHS.byId(id));
    return parseCustomerOrderResponse(response.data);
  });
}

export async function verifyOrderPayment(
  orderId: string,
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResponse> {
  const id = requireOrderId(orderId);
  const body = toVerifyPaymentBody(input);

  return request(async () => {
    const response = await productClient.post<unknown>(ORDER_PATHS.verifyPayment(id), body);
    return parseVerifyPaymentResponse(response.data);
  });
}

export async function cancelCustomerOrder(orderId: string): Promise<CancelOrderResponse> {
  const id = requireOrderId(orderId);

  return request(async () => {
    const response = await productClient.post<unknown>(ORDER_PATHS.cancel(id));
    return parseCancelOrderResponse(response.data);
  });
}

export async function refundCustomerOrder(orderId: string): Promise<RefundOrderResponse> {
  const id = requireOrderId(orderId);

  return request(async () => {
    const response = await productClient.post<unknown>(ORDER_PATHS.refund(id));
    return parseRefundOrderResponse(response.data);
  });
}
