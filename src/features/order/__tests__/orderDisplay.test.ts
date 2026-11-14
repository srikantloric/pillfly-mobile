import {
  buildOrderBill,
  buildOrderTimeline,
  buildShipmentTracker,
  canCancelOrder,
  canReorderOrder,
  canRequestRefund,
  formatOrderStatusLabel,
  formatRefundStatusLabel,
  isCancelledOrder,
  shipmentItemSummary,
  shipmentStatusCopy,
} from "../utils/orderDisplay";

describe("formatOrderStatusLabel", () => {
  it.each([
    ["PAID", "Paid"],
    ["CONFIRMED", "Confirmed"],
    ["PROCESSING", "Processing"],
    ["SHIPPED", "Shipped"],
    ["DELIVERED", "Delivered"],
    ["CANCELLED", "Cancelled"],
    ["REFUND_PENDING", "Refund Pending"],
    ["REFUNDED", "Refunded"],
  ])("maps %s to %s", (status, label) => {
    expect(formatOrderStatusLabel(status)).toBe(label);
  });

  it("uses a safe title-case label for statuses outside the badge table", () => {
    expect(formatOrderStatusLabel("PAYMENT_PENDING")).toBe("Payment Pending");
    expect(formatOrderStatusLabel("PAYMENT_PROCESSING")).toBe("Payment Processing");
    expect(formatOrderStatusLabel("ON_HOLD")).toBe("On Hold");
  });

  it("returns an empty label for a missing status", () => {
    expect(formatOrderStatusLabel("")).toBe("");
    expect(formatOrderStatusLabel(null)).toBe("");
    expect(formatOrderStatusLabel(undefined)).toBe("");
  });
});

describe("buildOrderTimeline", () => {
  it("marks only Paid as current and leaves the later stages pending", () => {
    const timeline = buildOrderTimeline("PAID");

    expect(timeline).toEqual({
      kind: "lifecycle",
      steps: [
        { status: "PAID", label: "Paid", state: "current" },
        { status: "CONFIRMED", label: "Confirmed", state: "pending" },
        { status: "PROCESSING", label: "Processing", state: "pending" },
        { status: "SHIPPED", label: "Shipped", state: "pending" },
        { status: "DELIVERED", label: "Delivered", state: "pending" },
      ],
    });
  });

  it("marks stages through Shipped as reached and Delivered as pending", () => {
    const timeline = buildOrderTimeline("SHIPPED");
    if (timeline.kind !== "lifecycle") {
      throw new Error("expected a delivery timeline");
    }

    expect(timeline.steps.map((step) => step.state)).toEqual([
      "completed",
      "completed",
      "completed",
      "current",
      "pending",
    ]);
  });

  it("marks Delivered as the current stage after the earlier stages", () => {
    const timeline = buildOrderTimeline("DELIVERED");
    if (timeline.kind !== "lifecycle") {
      throw new Error("expected a delivery timeline");
    }

    expect(timeline.steps.map((step) => [step.label, step.state])).toEqual([
      ["Paid", "completed"],
      ["Confirmed", "completed"],
      ["Processing", "completed"],
      ["Shipped", "completed"],
      ["Delivered", "current"],
    ]);
  });

  it("replaces the delivery timeline for cancelled and refund statuses", () => {
    expect(buildOrderTimeline("CANCELLED")).toEqual({
      kind: "single",
      label: "Cancelled",
      tone: "cancelled",
    });
    expect(buildOrderTimeline("REFUND_PENDING")).toEqual({
      kind: "single",
      label: "Refund Pending",
      tone: "neutral",
    });
    expect(buildOrderTimeline("REFUNDED")).toEqual({
      kind: "single",
      label: "Refunded",
      tone: "neutral",
    });
  });

  it("does not mark delivery stages reached before payment is complete", () => {
    expect(buildOrderTimeline("PAYMENT_PENDING")).toEqual({
      kind: "single",
      label: "Payment Pending",
      tone: "neutral",
    });
    expect(buildOrderTimeline("UNKNOWN")).toEqual({
      kind: "single",
      label: "Unknown",
      tone: "neutral",
    });
  });
});

describe("canReorderOrder", () => {
  it("allows reorder for delivered, cancelled, and refunded orders", () => {
    expect(canReorderOrder("DELIVERED")).toBe(true);
    expect(canReorderOrder("CANCELLED")).toBe(true);
    expect(canReorderOrder("REFUNDED")).toBe(true);
  });

  it("hides reorder for in-progress and refund-pending statuses", () => {
    expect(canReorderOrder("PAID")).toBe(false);
    expect(canReorderOrder("CONFIRMED")).toBe(false);
    expect(canReorderOrder("PROCESSING")).toBe(false);
    expect(canReorderOrder("SHIPPED")).toBe(false);
    expect(canReorderOrder("REFUND_PENDING")).toBe(false);
    expect(canReorderOrder("PAYMENT_PENDING")).toBe(false);
    expect(canReorderOrder(null)).toBe(false);
  });
});

describe("buildShipmentTracker", () => {
  it("maps paid and confirmed to the confirmed stage", () => {
    expect(buildShipmentTracker("PAID")?.map((step) => [step.label, step.state])).toEqual([
      ["Confirmed", "current"],
      ["Packing", "pending"],
      ["Out for Delivery", "pending"],
      ["Delivered", "pending"],
    ]);
    expect(buildShipmentTracker("CONFIRMED")?.[0]?.state).toBe("current");
  });

  it("marks packing through delivered from the order status", () => {
    expect(buildShipmentTracker("PROCESSING")?.map((step) => step.state)).toEqual([
      "completed",
      "current",
      "pending",
      "pending",
    ]);
    expect(buildShipmentTracker("SHIPPED")?.map((step) => step.state)).toEqual([
      "completed",
      "completed",
      "current",
      "pending",
    ]);
    expect(buildShipmentTracker("DELIVERED")?.map((step) => step.state)).toEqual([
      "completed",
      "completed",
      "completed",
      "current",
    ]);
  });

  it("hides the shipment tracker for cancelled and payment-pending orders", () => {
    expect(buildShipmentTracker("CANCELLED")).toBeNull();
    expect(buildShipmentTracker("REFUND_PENDING")).toBeNull();
    expect(buildShipmentTracker("PAYMENT_PENDING")).toBeNull();
  });
});

describe("buildOrderBill", () => {
  it("sums MRP, discount, and savings from the order items", () => {
    expect(
      buildOrderBill(
        [
          { mrp: 55, quantity: 1, unitPrice: 44, totalPrice: 44 },
          { mrp: 50, quantity: 2, unitPrice: 40, totalPrice: 80 },
        ],
        124,
        124,
      ),
    ).toEqual({
      mrpTotal: 155,
      discountTotal: 31,
      subtotal: 124,
      totalAmount: 124,
      savings: 31,
    });
  });

  it("does not invent a negative discount or savings", () => {
    expect(buildOrderBill([{ mrp: 40, quantity: 1, unitPrice: 44, totalPrice: 44 }], 44, 50)).toEqual({
      mrpTotal: 40,
      discountTotal: 0,
      subtotal: 44,
      totalAmount: 50,
      savings: 0,
    });
  });
});

describe("shipment helpers", () => {
  it("labels cancelled orders and keeps cancel off those statuses", () => {
    expect(isCancelledOrder("CANCELLED")).toBe(true);
    expect(isCancelledOrder("REFUNDED")).toBe(true);
    expect(isCancelledOrder("PROCESSING")).toBe(false);
    expect(canCancelOrder("PROCESSING")).toBe(true);
    expect(canCancelOrder("CANCELLED")).toBe(false);
    expect(canCancelOrder("DELIVERED")).toBe(false);
    expect(shipmentStatusCopy("PROCESSING").badge).toBe("On Track");
    expect(shipmentStatusCopy("CANCELLED").badgeTone).toBe("danger");
    expect(shipmentStatusCopy("REFUND_PENDING").badge).toBe("Refund Processing");
    expect(shipmentStatusCopy("REFUNDED").badge).toBe("Refund Completed");
  });

  it("summarizes shipment line count with the first title only", () => {
    expect(
      shipmentItemSummary([
        { title: "Dolo 650", quantity: 1 },
        { title: "Liveasy Powder", quantity: 2 },
        { title: "Thermometer", quantity: 1 },
      ]),
    ).toEqual({
      count: 3,
      titles: "Dolo 650 + 2 more",
    });
  });
});

describe("canRequestRefund", () => {
  it("hides request refund when refund is already pending or completed", () => {
    expect(canRequestRefund("REFUND_PENDING")).toBe(false);
    expect(canRequestRefund("REFUNDED")).toBe(false);
    expect(canRequestRefund("CANCELLED", "pending", "CAPTURED")).toBe(false);
    expect(canRequestRefund("CANCELLED", "processed", "CAPTURED")).toBe(false);
  });

  it("hides request refund before payment is captured or while the order can still be cancelled", () => {
    expect(canRequestRefund("PAYMENT_PENDING", null, "CREATED")).toBe(false);
    expect(canRequestRefund("PAYMENT_PROCESSING", null, "AUTHORIZED")).toBe(false);
    expect(canRequestRefund("PAID", null, "CAPTURED")).toBe(false);
    expect(canRequestRefund("CANCELLED", null, "FAILED")).toBe(false);
  });

  it("keeps request refund for cancelled or delivered orders after payment capture", () => {
    expect(canRequestRefund("CANCELLED", null, "CAPTURED")).toBe(true);
    expect(canRequestRefund("CANCELLED", "failed", "CAPTURED")).toBe(true);
    expect(canRequestRefund("DELIVERED", null, "CAPTURED")).toBe(true);
  });
});

describe("formatRefundStatusLabel", () => {
  it("maps refund and order statuses to processing, completed, or failed", () => {
    expect(formatRefundStatusLabel("pending")).toBe("Refund Processing");
    expect(formatRefundStatusLabel("processed")).toBe("Refund Completed");
    expect(formatRefundStatusLabel("failed")).toBe("Refund Failed");
    expect(formatRefundStatusLabel("REFUND_PENDING")).toBe("Refund Processing");
    expect(formatRefundStatusLabel("REFUNDED")).toBe("Refund Completed");
  });
});
