import {
  planOrdersRefresh,
  reconcileOrderAfterMutation,
  shouldShowOrderDetailFullScreenLoader,
  shouldShowOrdersFullScreenLoader,
} from "../utils/orderRefresh";
import type { CustomerOrder } from "../types/order.types";

function order(status: CustomerOrder["status"]): CustomerOrder {
  return {
    id: "ord_1",
    customerId: "cus_1",
    items: [
      {
        productId: "prod_1",
        variantId: "var_1",
        title: "Dolo",
        sku: "SKU-1",
        quantity: 1,
        mrp: 50,
        sellingDiscount: 10,
        unitPrice: 40,
        totalPrice: 40,
      },
    ],
    subtotal: 40,
    totalAmount: 40,
    currency: "INR",
    status,
    paymentStatus: "CAPTURED",
    shippingAddress: {
      addressId: "addr_1",
      recipientName: "Ada",
      phoneNumber: "9999999999",
      addressLine1: "1 Main",
      city: "Pune",
      state: "MH",
      postalCode: "411001",
      countryCode: "IN",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("planOrdersRefresh", () => {
  it("uses a full-screen loader only for the initial load", () => {
    expect(planOrdersRefresh("initial")).toEqual({
      replaceList: true,
      fullScreenLoader: true,
      loadingMore: false,
    });
    expect(planOrdersRefresh("focus")).toEqual({
      replaceList: true,
      fullScreenLoader: false,
      loadingMore: false,
    });
  });

  it("keeps pagination as an append-only load-more request", () => {
    expect(planOrdersRefresh("more", "cursor-2")).toEqual({
      replaceList: false,
      fullScreenLoader: false,
      loadingMore: true,
      cursor: "cursor-2",
    });
    expect(planOrdersRefresh("more")).toEqual({
      replaceList: false,
      fullScreenLoader: false,
      loadingMore: true,
    });
  });
});

describe("full-screen loader guards", () => {
  it("hides the order detail loader once an order is already visible", () => {
    expect(shouldShowOrderDetailFullScreenLoader("loading", null)).toBe(true);
    expect(shouldShowOrderDetailFullScreenLoader("loading", order("PAID"))).toBe(false);
    expect(shouldShowOrderDetailFullScreenLoader("ready", order("PAID"))).toBe(false);
  });

  it("hides the orders loader during focus soft refresh", () => {
    expect(shouldShowOrdersFullScreenLoader("loading", "initial")).toBe(true);
    expect(shouldShowOrdersFullScreenLoader("loading", "focus")).toBe(false);
    expect(shouldShowOrdersFullScreenLoader("ready", "focus")).toBe(false);
    expect(shouldShowOrdersFullScreenLoader("loading", "more")).toBe(false);
  });
});

describe("reconcileOrderAfterMutation", () => {
  it("applies a successful cancel response then performs one detail GET", async () => {
    const calls: string[] = [];
    const mutationOrder = order("PAID");
    const reconciledOrder = order("CANCELLED");
    const onMutation = jest.fn();

    const result = await reconcileOrderAfterMutation({
      orderId: "ord_1",
      mutate: async () => {
        calls.push("cancel");
        return { order: mutationOrder };
      },
      getOrder: async (orderId) => {
        calls.push(`get:${orderId}`);
        return reconciledOrder;
      },
      onMutation,
    });

    expect(calls).toEqual(["cancel", "get:ord_1"]);
    expect(onMutation).toHaveBeenCalledTimes(1);
    expect(onMutation).toHaveBeenCalledWith({ order: mutationOrder });
    expect(result.order.status).toBe("CANCELLED");
    expect(result.reconcileError).toBeUndefined();
  });

  it("applies a successful refund response then performs one detail GET", async () => {
    const calls: string[] = [];
    const mutationOrder = order("REFUND_PENDING");
    const reconciledOrder = order("REFUNDED");
    const refund = {
      id: "rfnd_1",
      status: "pending" as const,
      amount: 40,
      currency: "INR",
      paymentId: "pay_1",
    };
    const onMutation = jest.fn();

    const result = await reconcileOrderAfterMutation({
      orderId: "ord_1",
      mutate: async () => {
        calls.push("refund");
        return { order: mutationOrder, refund };
      },
      getOrder: async (orderId) => {
        calls.push(`get:${orderId}`);
        return reconciledOrder;
      },
      onMutation,
    });

    expect(calls).toEqual(["refund", "get:ord_1"]);
    expect(onMutation).toHaveBeenCalledWith({ order: mutationOrder, refund });
    expect(result.order).toEqual(reconciledOrder);
  });

  it("keeps the mutation order when the follow-up GET fails", async () => {
    const mutationOrder = order("CANCELLED");
    const onMutation = jest.fn();

    const result = await reconcileOrderAfterMutation({
      orderId: "ord_1",
      mutate: async () => ({ order: mutationOrder }),
      getOrder: async () => {
        throw new Error("network");
      },
      onMutation,
    });

    expect(onMutation).toHaveBeenCalledWith({ order: mutationOrder });
    expect(result.order).toEqual(mutationOrder);
    expect(result.reconcileError).toBeInstanceOf(Error);
  });
});
