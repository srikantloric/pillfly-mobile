import { API_CONFIG } from "@/config/api.config";
import { RequestError } from "@/services/api/requestError";
import { colors } from "@/theme";
import { toCustomerMessage } from "@/utils/customerMessage";

import type { OrderPayment, VerifyPaymentInput } from "../types/order.types";

export type RazorpaySuccessData = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayPrefill = {
  name?: string;
  contact?: string;
};

export function buildRazorpayOptions(payment: OrderPayment, prefill?: RazorpayPrefill) {
  const key = API_CONFIG.RAZORPAY_KEY_ID.trim();
  if (!key) {
    return null;
  }

  const contact = prefill?.contact?.trim();
  const name = prefill?.name?.trim();

  return {
    key,
    amount: payment.amount,
    currency: payment.currency,
    name: "Pillfly",
    description: "Order payment",
    order_id: payment.razorpayOrderId,
    theme: { color: colors.primary },
    ...(name || contact
      ? {
          prefill: {
            ...(name ? { name } : {}),
            ...(contact ? { contact } : {}),
          },
        }
      : {}),
  };
}

export function toRazorpayVerifyInput(data: RazorpaySuccessData): VerifyPaymentInput | null {
  const razorpayOrderId = data.razorpay_order_id?.trim() ?? "";
  const razorpayPaymentId = data.razorpay_payment_id?.trim() ?? "";
  const razorpaySignature = data.razorpay_signature?.trim() ?? "";

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return null;
  }

  return { razorpayOrderId, razorpayPaymentId, razorpaySignature };
}

const INSUFFICIENT_STOCK = /^Insufficient stock for .+ Available: (\d+)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function usableText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();
  if (!text || text === "undefined" || text === "null" || text.startsWith("{") || text.startsWith("[")) {
    return null;
  }

  return text;
}

function razorpayDetail(error: Record<string, unknown>): Record<string, unknown> | null {
  if (isRecord(error.error)) {
    return error.error;
  }

  if (typeof error.description !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(error.description) as unknown;
    if (isRecord(parsed) && isRecord(parsed.error)) {
      return parsed.error;
    }

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function stockMessage(message: string): string | null {
  const available = Number(INSUFFICIENT_STOCK.exec(message)?.[1]);
  if (!Number.isInteger(available)) {
    return null;
  }

  if (available <= 0) {
    return "An item in your cart is out of stock.";
  }

  if (available === 1) {
    return "Only 1 is available for an item in your cart.";
  }

  return `Only ${available} are available for an item in your cart.`;
}

export function razorpayErrorMessage(error: unknown): string {
  if (error instanceof RequestError) {
    return stockMessage(error.message) ?? toCustomerMessage(error);
  }

  if (isRecord(error)) {
    const detail = razorpayDetail(error);
    const detailText = detail ? usableText(detail.description) : null;
    if (detailText) {
      return detailText;
    }

    const directText = usableText(error.description);
    if (directText) {
      return directText;
    }

    if (detail) {
      return "Payment was not completed.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return toCustomerMessage(error);
  }

  return "Payment was not completed.";
}
