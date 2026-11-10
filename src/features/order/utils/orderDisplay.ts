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
  return status === "DELIVERED" || status === "CANCELLED";
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
