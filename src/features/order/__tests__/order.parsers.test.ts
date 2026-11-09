import { RequestError } from "@/services/api/requestError";

import {
  parseCancelOrderResponse,
  parseCreateOrderResponse,
  parseCustomerOrderListResponse,
  parseCustomerOrderResponse,
  parseRefundOrderResponse,
  parseVerifyPaymentResponse,
  toCreateOrderBody,
  toVerifyPaymentBody,
} from "../api/order.parsers";

const item = {
  productId: "prod_1",
  variantId: "var_1",
  title: "Paracetamol 500 mg",
  sku: "PCM-500-10",
  quantity: 2,
  mrp: 50,
  sellingDiscount: 10,
  unitPrice: 40,
  totalPrice: 80,
};

const shippingAddress = {
  addressId: "addr_1",
  recipientName: "Purna",
  phoneNumber: "+919876543210",
  addressLine1: "Main Road",
  city: "Kolkata",
  state: "West Bengal",
  postalCode: "700001",
  countryCode: "IN",
};

const address = {
  id: "addr_1",
  label: "HOME",
  recipientName: "Purna",
  phoneNumber: "+919876543210",
  addressLine1: "Main Road",
  city: "Kolkata",
  state: "West Bengal",
  postalCode: "700001",
  countryCode: "IN",
  createdAt: "2026-11-09T10:00:00.000Z",
  updatedAt: "2026-11-09T10:00:00.000Z",
};

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: "ord_1",
    customerId: "cus_1",
    items: [item],
    subtotal: 80,
    totalAmount: 80,
    currency: "INR",
    status: "PAYMENT_PENDING",
    paymentStatus: "CREATED",
    shippingAddress,
    createdAt: "2026-11-09T10:00:00.000Z",
    updatedAt: "2026-11-09T10:00:00.000Z",
    ...overrides,
  };
}

describe("order parsers", () => {
  it("lists orders and keeps a non-empty cursor", () => {
    const result = parseCustomerOrderListResponse({
      success: true,
      data: [order(), { id: "broken" }, order({ id: "ord_2", currency: "USD" })],
      nextCursor: "cursor-2",
    });

    expect(result.data.map((entry) => entry.id)).toEqual(["ord_1"]);
    expect(result.nextCursor).toBe("cursor-2");
  });

  it("omits a blank cursor and rejects a cursor that is not a string", () => {
    expect(parseCustomerOrderListResponse({ success: true, data: [] }).nextCursor).toBeUndefined();
    expect(
      parseCustomerOrderListResponse({ success: true, data: [], nextCursor: "  " }).nextCursor,
    ).toBeUndefined();
    expect(() =>
      parseCustomerOrderListResponse({ success: true, data: [], nextCursor: 12 }),
    ).toThrow(RequestError);
  });

  it("rejects a list envelope that is not a successful array", () => {
    expect(() => parseCustomerOrderListResponse({ success: false, error: [], data: null })).toThrow(
      RequestError,
    );
    expect(() => parseCustomerOrderListResponse({ success: true, data: null })).toThrow(RequestError);
  });

  it("parses the flat create response and keeps the payment amount in paise", () => {
    const result = parseCreateOrderResponse({
      success: true,
      message: "Order created successfully",
      customerId: "cus_1",
      address,
      pricing: {
        items: [{ ...item, availableQty: 25 }],
        subtotal: 80,
      },
      order: order({
        razorpayOrderId: "order_rzp_1",
        refundAmount: 0,
      }),
      payment: {
        razorpayOrderId: "order_rzp_1",
        amount: 8000,
        currency: "INR",
      },
    });

    expect(result.payment).toEqual({
      razorpayOrderId: "order_rzp_1",
      amount: 8000,
      currency: "INR",
    });
    expect(result.order.totalAmount).toBe(80);
    expect(result.order.refundAmount).toBe(0);
    expect(result.pricing.items[0].availableQty).toBe(25);
    expect(result.address.id).toBe("addr_1");
  });

  it("rejects a create response wrapped only under data", () => {
    expect(() =>
      parseCreateOrderResponse({
        success: true,
        data: order(),
      }),
    ).toThrow(RequestError);
  });

  it("reads one order from data", () => {
    const result = parseCustomerOrderResponse({
      success: true,
      data: order({
        shippingAddress: { ...shippingAddress, addressLine2: "Near court", landmark: "Park" },
      }),
    });

    expect(result.shippingAddress.addressLine2).toBe("Near court");
    expect(result.shippingAddress.landmark).toBe("Park");
    expect(result.razorpayOrderId).toBeUndefined();
  });

  it("reads payment verification from the top-level order", () => {
    const result = parseVerifyPaymentResponse({
      success: true,
      message: "Payment verified successfully",
      order: order({ status: "PAID", paymentStatus: "CAPTURED" }),
    });

    expect(result.message).toBe("Payment verified successfully");
    expect(result.order.status).toBe("PAID");
    expect(() =>
      parseVerifyPaymentResponse({
        success: true,
        message: "Payment verified successfully",
        data: order(),
      }),
    ).toThrow(RequestError);
  });

  it("reads a cancelled order from data", () => {
    const result = parseCancelOrderResponse({
      success: true,
      message: "Order cancelled successfully",
      data: order({ status: "CANCELLED" }),
    });

    expect(result.order.status).toBe("CANCELLED");
  });

  it("reads a refund from data.order and data.refund", () => {
    const result = parseRefundOrderResponse({
      success: true,
      message: "Refund request created",
      data: {
        order: order({ status: "REFUND_PENDING", paymentStatus: "CAPTURED" }),
        refund: {
          id: "rfnd_1",
          status: "pending",
          amount: 80,
          currency: "INR",
          paymentId: "pay_1",
        },
      },
    });

    expect(result.refund).toEqual({
      id: "rfnd_1",
      status: "pending",
      amount: 80,
      currency: "INR",
      paymentId: "pay_1",
    });
    expect(() =>
      parseRefundOrderResponse({
        success: true,
        message: "Refund request created",
        data: {
          order: order(),
          refund: { id: "rfnd_1", status: "PROCESSED", amount: 80, currency: "INR", paymentId: "pay_1" },
        },
      }),
    ).toThrow(RequestError);
  });

  it("builds a create body without prices and rejects a missing SKU", () => {
    expect(
      toCreateOrderBody({
        addressId: " addr_1 ",
        items: [{ productId: " prod_1 ", variantId: " var_1 ", quantity: 2, sku: " PCM-500-10 " }],
      }),
    ).toEqual({
      addressId: "addr_1",
      items: [{ productId: "prod_1", variantId: "var_1", quantity: 2, sku: "PCM-500-10" }],
    });

    expect(() =>
      toCreateOrderBody({
        addressId: "addr_1",
        items: [{ productId: "prod_1", variantId: "var_1", quantity: 1, sku: " " }],
      }),
    ).toThrow(RequestError);
  });

  it("requires all three payment verification fields", () => {
    expect(
      toVerifyPaymentBody({
        razorpayOrderId: " order_1 ",
        razorpayPaymentId: " pay_1 ",
        razorpaySignature: " sig_1 ",
      }),
    ).toEqual({
      razorpayOrderId: "order_1",
      razorpayPaymentId: "pay_1",
      razorpaySignature: "sig_1",
    });

    expect(() =>
      toVerifyPaymentBody({
        razorpayOrderId: "order_1",
        razorpayPaymentId: "pay_1",
        razorpaySignature: "",
      }),
    ).toThrow(RequestError);
  });
});
