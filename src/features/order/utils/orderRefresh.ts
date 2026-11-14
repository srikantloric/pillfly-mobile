import type { CustomerOrder } from "../types/order.types";

export type OrdersRefreshKind = "initial" | "focus" | "more";

export type OrdersRefreshPlan = {
  replaceList: boolean;
  fullScreenLoader: boolean;
  loadingMore: boolean;
  cursor?: string;
};

export function planOrdersRefresh(kind: OrdersRefreshKind, cursor?: string): OrdersRefreshPlan {
  if (kind === "more") {
    return {
      replaceList: false,
      fullScreenLoader: false,
      loadingMore: true,
      ...(cursor ? { cursor } : {}),
    };
  }

  if (kind === "focus") {
    return {
      replaceList: true,
      fullScreenLoader: false,
      loadingMore: false,
    };
  }

  return {
    replaceList: true,
    fullScreenLoader: true,
    loadingMore: false,
  };
}

export function shouldShowOrderDetailFullScreenLoader(
  status: "loading" | "ready" | "error",
  order: CustomerOrder | null,
): boolean {
  return status === "loading" && order == null;
}

export function shouldShowOrdersFullScreenLoader(
  status: "loading" | "ready" | "error",
  kind: OrdersRefreshKind,
): boolean {
  return status === "loading" && kind === "initial";
}

export async function reconcileOrderAfterMutation<T extends { order: CustomerOrder }>(options: {
  mutate: () => Promise<T>;
  getOrder: (orderId: string) => Promise<CustomerOrder>;
  orderId: string;
  onMutation: (mutation: T) => void;
}): Promise<{ mutation: T; order: CustomerOrder; reconcileError?: unknown }> {
  const mutation = await options.mutate();
  options.onMutation(mutation);

  try {
    const order = await options.getOrder(options.orderId);
    return { mutation, order };
  } catch (reconcileError) {
    return { mutation, order: mutation.order, reconcileError };
  }
}
