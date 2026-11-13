const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock("@/services/api/product.client", () => ({
  productClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import { RequestError } from "@/services/api/requestError";

import {
  cancelCustomerOrder,
  createCustomerOrder,
  getCustomerOrder,
  listCustomerOrders,
  refundCustomerOrder,
  verifyOrderPayment,
} from "../api/order.api";
import { ORDER_PATHS } from "../api/order.paths";

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

const order = {
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
};

describe("order.api", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it("lists orders with the default page size and descending sort", async () => {
    mockGet.mockResolvedValue({
      data: { success: true, data: [order], nextCursor: "cursor-2" },
    });

    const result = await listCustomerOrders();

    expect(mockGet).toHaveBeenCalledWith(ORDER_PATHS.collection, {
      params: { limit: 20, sortOrder: "desc" },
    });
    expect(result.data).toHaveLength(1);
    expect(result.nextCursor).toBe("cursor-2");
  });

  it("sends a cursor and clamps the page size", async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: [] } });

    await listCustomerOrders({ limit: 500, cursor: " cursor-2 ", sortOrder: "asc" });

    expect(mockGet).toHaveBeenCalledWith(ORDER_PATHS.collection, {
      params: { limit: 100, sortOrder: "asc", cursor: "cursor-2" },
    });
  });

  it("creates an order without sending local prices", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        message: "Order created successfully",
        customerId: "cus_1",
        address,
        pricing: { items: [{ ...item, availableQty: 25 }], subtotal: 80 },
        order,
        payment: { razorpayOrderId: "order_rzp_1", amount: 8000, currency: "INR" },
      },
    });

    const result = await createCustomerOrder({
      addressId: "addr_1",
      items: [{ productId: "prod_1", variantId: "var_1", quantity: 2, sku: "PCM-500-10" }],
    });

    expect(mockPost).toHaveBeenCalledWith(ORDER_PATHS.collection, {
      addressId: "addr_1",
      items: [{ productId: "prod_1", variantId: "var_1", quantity: 2, sku: "PCM-500-10" }],
    });
    expect(result.payment.amount).toBe(8000);
  });

  it("does not post an order when a variant id is missing", async () => {
    await expect(
      createCustomerOrder({
        addressId: "addr_1",
        items: [{ productId: "prod_1", variantId: "", quantity: 1, sku: "PCM-500-10" }],
      }),
    ).rejects.toBeInstanceOf(RequestError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("gets one order by an encoded id", async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: order } });

    const result = await getCustomerOrder("ord/1");

    expect(mockGet).toHaveBeenCalledWith(ORDER_PATHS.byId("ord/1"));
    expect(result.id).toBe("ord_1");
  });

  it("verifies payment with the three callback fields", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        message: "Payment verified successfully",
        order: { ...order, status: "PAID", paymentStatus: "CAPTURED" },
      },
    });

    const result = await verifyOrderPayment("ord_1", {
      razorpayOrderId: "order_rzp_1",
      razorpayPaymentId: "pay_1",
      razorpaySignature: "sig_1",
    });

    expect(mockPost).toHaveBeenCalledWith(ORDER_PATHS.verifyPayment("ord_1"), {
      razorpayOrderId: "order_rzp_1",
      razorpayPaymentId: "pay_1",
      razorpaySignature: "sig_1",
    });
    expect(result.order.paymentStatus).toBe("CAPTURED");
  });

  it("does not verify payment when the signature is missing", async () => {
    await expect(
      verifyOrderPayment("ord_1", {
        razorpayOrderId: "order_rzp_1",
        razorpayPaymentId: "pay_1",
        razorpaySignature: " ",
      }),
    ).rejects.toBeInstanceOf(RequestError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("cancels an order with no request body", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        message: "Order cancelled successfully",
        data: { ...order, status: "CANCELLED" },
      },
    });

    const result = await cancelCustomerOrder("ord_1");

    expect(mockPost).toHaveBeenCalledWith(ORDER_PATHS.cancel("ord_1"));
    expect(result.order.status).toBe("CANCELLED");
  });

  it("requests a refund with no request body", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        message: "Refund request created",
        data: {
          order: { ...order, status: "REFUND_PENDING" },
          refund: {
            id: "rfnd_1",
            status: "pending",
            amount: 80,
            currency: "INR",
            paymentId: "pay_1",
          },
        },
      },
    });

    const result = await refundCustomerOrder("ord_1");

    expect(mockPost).toHaveBeenCalledWith(ORDER_PATHS.refund("ord_1"));
    expect(result.refund.status).toBe("pending");
  });

  it("uses the validation fallback when the error array has no message", async () => {
    mockGet.mockRejectedValue({
      response: { status: 400, data: { success: false, error: [], data: null } },
    });

    await expect(listCustomerOrders()).rejects.toMatchObject({
      message: "Unable to complete this order request.",
      status: 400,
    });
  });

  it("prefers a server message and maps network failures", async () => {
    mockGet.mockRejectedValueOnce({
      response: { status: 404, data: { message: "Order missing" } },
    });
    await expect(getCustomerOrder("ord_1")).rejects.toMatchObject({
      message: "Order missing",
      status: 404,
    });

    mockGet.mockRejectedValueOnce({ request: {} });
    await expect(getCustomerOrder("ord_1")).rejects.toMatchObject({ kind: "network" });
  });

  it("does not call the API for a blank order id", async () => {
    await expect(getCustomerOrder("  ")).rejects.toBeInstanceOf(RequestError);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
