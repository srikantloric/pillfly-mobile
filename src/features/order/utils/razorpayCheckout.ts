import { API_CONFIG } from "@/config/api.config";
import { RequestError } from "@/services/api/requestError";
import { colors } from "@/theme";

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

export function razorpayErrorMessage(error: unknown): string {
  if (error instanceof RequestError) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "description" in error) {
    const description = error.description;
    if (typeof description === "string" && description.trim()) {
      return description.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Payment was not completed.";
}
