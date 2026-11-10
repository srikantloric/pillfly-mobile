import { buildOrderTimeline, canReorderOrder, formatOrderStatusLabel } from "../utils/orderDisplay";

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
  it("allows reorder only for delivered and cancelled orders", () => {
    expect(canReorderOrder("DELIVERED")).toBe(true);
    expect(canReorderOrder("CANCELLED")).toBe(true);
  });

  it("hides reorder for in-progress and refund statuses", () => {
    expect(canReorderOrder("PAID")).toBe(false);
    expect(canReorderOrder("CONFIRMED")).toBe(false);
    expect(canReorderOrder("PROCESSING")).toBe(false);
    expect(canReorderOrder("SHIPPED")).toBe(false);
    expect(canReorderOrder("REFUND_PENDING")).toBe(false);
    expect(canReorderOrder("REFUNDED")).toBe(false);
    expect(canReorderOrder("PAYMENT_PENDING")).toBe(false);
    expect(canReorderOrder(null)).toBe(false);
  });
});
