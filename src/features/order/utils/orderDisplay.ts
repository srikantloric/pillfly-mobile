const ORDER_STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUND_PENDING: "Refund Pending",
  REFUNDED: "Refunded",
};

const DELIVERY_STAGES = ["PAID", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export type TimelineStepState = "completed" | "current" | "pending";

export type OrderTimelineStep = {
  status: (typeof DELIVERY_STAGES)[number];
  label: string;
  state: TimelineStepState;
};

export type OrderTimeline =
  | { kind: "lifecycle"; steps: OrderTimelineStep[] }
  | { kind: "single"; label: string; tone: "cancelled" | "neutral" };

export function formatOrderLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatOrderStatusLabel(status: string | null | undefined): string {
  if (typeof status !== "string" || status.trim().length === 0) {
    return "";
  }

  return ORDER_STATUS_LABELS[status] ?? formatOrderLabel(status);
}

export function canReorderOrder(status: string | null | undefined): boolean {
  return status === "DELIVERED" || status === "CANCELLED" || status === "REFUNDED";
}

function timelineState(index: number, currentIndex: number): TimelineStepState {
  if (index < currentIndex) {
    return "completed";
  }

  if (index === currentIndex) {
    return "current";
  }

  return "pending";
}

export function buildOrderTimeline(status: string | null | undefined): OrderTimeline {
  const currentIndex = DELIVERY_STAGES.findIndex((stage) => stage === status);
  if (currentIndex === -1) {
    return {
      kind: "single",
      label: formatOrderStatusLabel(status),
      tone: status === "CANCELLED" ? "cancelled" : "neutral",
    };
  }

  return {
    kind: "lifecycle",
    steps: DELIVERY_STAGES.map((stage, index) => ({
      status: stage,
      label: ORDER_STATUS_LABELS[stage],
      state: timelineState(index, currentIndex),
    })),
  };
}

export function formatOrderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatOrderPlacedOn(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  return `${day} ${month}`;
}

export function formatOrderPlacedDetail(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  return `${weekday}, ${day} ${month}`;
}

export function formatOrderDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = date.getDate();
  const month = date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${month} ${year}, ${time}`;
}

const SHIPMENT_STAGES = ["CONFIRMED", "PACKING", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export type ShipmentStage = (typeof SHIPMENT_STAGES)[number];

export type ShipmentTrackerStep = {
  stage: ShipmentStage;
  label: string;
  state: TimelineStepState;
};

const SHIPMENT_STAGE_LABELS: Record<ShipmentStage, string> = {
  CONFIRMED: "Confirmed",
  PACKING: "Packing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

function shipmentStageIndex(status: string | null | undefined): number {
  switch (status) {
    case "PAID":
    case "CONFIRMED":
      return 0;
    case "PROCESSING":
      return 1;
    case "SHIPPED":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return -1;
  }
}

export function buildShipmentTracker(status: string | null | undefined): ShipmentTrackerStep[] | null {
  const currentIndex = shipmentStageIndex(status);
  if (currentIndex < 0) {
    return null;
  }

  return SHIPMENT_STAGES.map((stage, index) => ({
    stage,
    label: SHIPMENT_STAGE_LABELS[stage],
    state: timelineState(index, currentIndex),
  }));
}

export function isCancelledOrder(status: string | null | undefined): boolean {
  return status === "CANCELLED" || status === "REFUND_PENDING" || status === "REFUNDED";
}

export function canCancelOrder(status: string | null | undefined): boolean {
  return (
    status === "PAYMENT_PENDING" ||
    status === "PAYMENT_PROCESSING" ||
    status === "PAID" ||
    status === "CONFIRMED" ||
    status === "PROCESSING" ||
    status === "SHIPPED"
  );
}

export function canRequestRefund(
  status: string | null | undefined,
  refundStatus?: string | null,
): boolean {
  if (status === "REFUND_PENDING" || status === "REFUNDED") {
    return false;
  }

  if (refundStatus === "pending" || refundStatus === "processed") {
    return false;
  }

  return true;
}

export function formatRefundStatusLabel(status: string | null | undefined): string {
  if (status === "pending" || status === "REFUND_PENDING") {
    return "Refund Processing";
  }

  if (status === "processed" || status === "REFUNDED") {
    return "Refund Completed";
  }

  if (status === "failed") {
    return "Refund Failed";
  }

  return formatOrderStatusLabel(status);
}

export function shipmentStatusCopy(status: string | null | undefined): {
  eyebrow: string;
  title: string;
  badge: string;
  badgeTone: "success" | "danger" | "neutral";
  band: string;
} {
  if (status === "CANCELLED") {
    return {
      eyebrow: "CANCELLED",
      title: formatOrderStatusLabel(status),
      badge: "Cancelled",
      badgeTone: "danger",
      band: "This order was cancelled.",
    };
  }

  if (status === "REFUND_PENDING") {
    return {
      eyebrow: "REFUND",
      title: "Refund Processing",
      badge: "Refund Processing",
      badgeTone: "neutral",
      band: "Your refund is being processed.",
    };
  }

  if (status === "REFUNDED") {
    return {
      eyebrow: "REFUND",
      title: "Refund Completed",
      badge: "Refund Completed",
      badgeTone: "success",
      band: "Your refund has been completed.",
    };
  }

  if (status === "DELIVERED") {
    return {
      eyebrow: "DELIVERED",
      title: "Delivered",
      badge: "Delivered",
      badgeTone: "success",
      band: "Your order has been delivered.",
    };
  }

  if (status === "SHIPPED") {
    return {
      eyebrow: "SHIPPING",
      title: "Out for delivery",
      badge: "On Track",
      badgeTone: "success",
      band: "Your order is out for delivery.",
    };
  }

  if (status === "PROCESSING") {
    return {
      eyebrow: "PACKING",
      title: "Being packed",
      badge: "On Track",
      badgeTone: "success",
      band: "Items in your order are being packed.",
    };
  }

  if (status === "PAID" || status === "CONFIRMED") {
    return {
      eyebrow: "ARRIVING",
      title: "Order confirmed",
      badge: "On Track",
      badgeTone: "success",
      band: "Items in your order are being prepared for dispatch.",
    };
  }

  return {
    eyebrow: "ORDER",
    title: formatOrderStatusLabel(status) || "Order",
    badge: formatOrderStatusLabel(status) || "Order",
    badgeTone: "neutral",
    band: "We are updating this order.",
  };
}

export type OrderBillLine = {
  mrpTotal: number;
  discountTotal: number;
  subtotal: number;
  totalAmount: number;
  savings: number;
};

export type OrderBillItem = {
  mrp: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export function buildOrderBill(
  items: readonly OrderBillItem[],
  subtotal: number,
  totalAmount: number,
): OrderBillLine {
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const soldTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountTotal = Math.max(0, mrpTotal - soldTotal);
  const savings = Math.max(0, mrpTotal - totalAmount);

  return {
    mrpTotal,
    discountTotal,
    subtotal,
    totalAmount,
    savings,
  };
}

export function shipmentItemSummary(items: readonly { title: string; quantity: number }[]): {
  count: number;
  titles: string;
} {
  const count = items.length;
  const firstTitle = items[0]?.title?.trim() ?? "";
  const extra = items.length > 1 ? ` + ${items.length - 1} more` : "";
  return { count, titles: firstTitle ? `${firstTitle}${extra}` : "" };
}
