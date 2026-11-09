import { API_CONFIG } from "@/config/api.config";
import { RequestError } from "@/services/api/requestError";

import {
  buildRazorpayOptions,
  razorpayErrorMessage,
  toRazorpayVerifyInput,
} from "../utils/razorpayCheckout";

const payment = {
  razorpayOrderId: "order_rzp_1",
  amount: 8000,
  currency: "INR",
};

describe("razorpay checkout", () => {
  it("passes the backend amount in paise and the configured key", () => {
    expect(
      buildRazorpayOptions(payment, { name: "Purna", contact: "+919876543210" }),
    ).toEqual({
      key: API_CONFIG.RAZORPAY_KEY_ID,
      amount: 8000,
      currency: "INR",
      name: "Pillfly",
      description: "Order payment",
      order_id: "order_rzp_1",
      theme: { color: "#0D9488" },
      prefill: { name: "Purna", contact: "+919876543210" },
    });
  });

  it("maps the checkout callback into the verify request", () => {
    expect(
      toRazorpayVerifyInput({
        razorpay_order_id: " order_rzp_1 ",
        razorpay_payment_id: " pay_1 ",
        razorpay_signature: " sig_1 ",
      }),
    ).toEqual({
      razorpayOrderId: "order_rzp_1",
      razorpayPaymentId: "pay_1",
      razorpaySignature: "sig_1",
    });

    expect(toRazorpayVerifyInput({ razorpay_payment_id: "pay_1" })).toBeNull();
  });

  it("uses the server message for a failed verification and the checkout message when payment stops", () => {
    expect(razorpayErrorMessage(new RequestError("Payment could not be verified.", { status: 400 }))).toBe(
      "Payment could not be verified.",
    );
    expect(razorpayErrorMessage({ description: "Payment processing cancelled by user" })).toBe(
      "Payment processing cancelled by user",
    );
    expect(razorpayErrorMessage(null)).toBe("Payment was not completed.");
  });
});
