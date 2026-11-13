import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedHeaderNavigation } from "@/components/header";
import { BouncingDotsLoader, ProductImageWithPlaceholder } from "@/components/ui";
import { useCartSummary } from "@/features/cart";
import { StoreProductsHeader } from "@/features/product/components/StoreProductsHeader";
import { productService } from "@/features/product/services/product.service";
import { getProductImageUrl, isHealthcareProduct, formatInr } from "@/features/product/utils/productDisplay";
import { RequestError } from "@/services/api/requestError";
import type { OrdersStackParamList } from "@/types/navigation.types";
import { toCustomerMessage } from "@/utils/customerMessage";

import { cancelCustomerOrder, getCustomerOrder, refundCustomerOrder } from "../api/order.api";
import type { CustomerOrder, OrderItem, OrderRefund } from "../types/order.types";
import {
  buildOrderBill,
  buildShipmentTracker,
  canCancelOrder,
  canRequestRefund,
  formatOrderDateTime,
  formatOrderLabel,
  formatOrderPlacedDetail,
  formatRefundStatusLabel,
  isCancelledOrder,
  shipmentItemSummary,
  shipmentStatusCopy,
  type TimelineStepState,
} from "../utils/orderDisplay";
import {
  reconcileOrderAfterMutation,
  shouldShowOrderDetailFullScreenLoader,
} from "../utils/orderRefresh";

function isRefundClientRejection(error: unknown): boolean {
  return (
    error instanceof RequestError &&
    error.kind === "http" &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 401
  );
}

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

function errorMessage(error: unknown): string {
  return toCustomerMessage(error);
}

function itemImage(item: OrderItem): string | undefined {
  const product = productService.getProductById(item.productId);
  if (!product) {
    return undefined;
  }

  if (isHealthcareProduct(product)) {
    return (
      product.variants.find((variant) => variant.id === item.variantId)?.images[0]?.url ??
      getProductImageUrl(product)
    );
  }

  return getProductImageUrl(product);
}

function badgeClass(tone: "success" | "danger" | "neutral"): string {
  if (tone === "danger") {
    return "text-pillfly-promo-red";
  }

  if (tone === "success") {
    return "text-[#16A34A]";
  }

  return "text-pillfly-muted";
}

function trackerDotClass(state: TimelineStepState): string {
  if (state === "pending") {
    return "border border-pillfly-line bg-pillfly-surface";
  }

  return "bg-pillfly-primary";
}

function trackerLineClass(reached: boolean): string {
  return reached ? "bg-pillfly-primary" : "bg-pillfly-line";
}

function BillRow({
  label,
  value,
  emphasize,
  positive,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  positive?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className={`text-[14px] ${emphasize ? "font-bold text-pillfly-ink" : "text-pillfly-ink"}`}>
        {label}
      </Text>
      <Text
        className={`text-[14px] ${
          positive ? "font-semibold text-[#16A34A]" : emphasize ? "font-bold text-pillfly-ink" : "font-semibold text-pillfly-ink"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function ShipmentTracker({ status }: { status: string }) {
  const steps = buildShipmentTracker(status);
  if (!steps) {
    return null;
  }

  return (
    <View className="mt-4 px-1">
      <View className="flex-row items-center px-2">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          const next = steps[index + 1];
          const lineReached = step.state !== "pending" && next != null && next.state !== "pending";

          return (
            <React.Fragment key={step.stage}>
              <View className={`h-2.5 w-2.5 rounded-full ${trackerDotClass(step.state)}`} />
              {last ? null : <View className={`mx-1 h-0.5 flex-1 ${trackerLineClass(lineReached)}`} />}
            </React.Fragment>
          );
        })}
      </View>
      <View className="mt-2 flex-row">
        {steps.map((step) => (
          <Text
            key={`${step.stage}-label`}
            className={`flex-1 text-center text-[11px] ${
              step.state === "pending" ? "text-pillfly-muted" : "font-semibold text-pillfly-ink"
            }`}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function OrderDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params;
  const { lineCount } = useCartSummary();
  const { onPressSearch, onPressCart } = useSharedHeaderNavigation(
    navigation as unknown as NavigationProp<ParamListBase>,
  );
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [refund, setRefund] = useState<OrderRefund | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"cancel" | "refund" | null>(null);
  const [refundDenied, setRefundDenied] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [catalogTick, setCatalogTick] = useState(0);

  const load = useCallback(() => {
    setStatus("loading");
    setError(null);
    setRefundDenied(false);
    return getCustomerOrder(orderId)
      .then((next) => {
        setOrder(next);
        setStatus("ready");
        const productIds = next.items.map((item) => item.productId);
        void productService.ensureProductsByIds(productIds).then(() => {
          setCatalogTick((current) => current + 1);
        });
      })
      .catch((caught: unknown) => {
        setError(errorMessage(caught));
        setStatus("error");
      });
  }, [orderId]);

  const applyReconciledOrder = useCallback((next: CustomerOrder) => {
    setOrder(next);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCancel = useCallback(() => {
    if (busy) {
      return;
    }

    Alert.alert("Cancel order", "Cancel this order?", [
      { text: "Keep order", style: "cancel" },
      {
        text: "Cancel order",
        style: "destructive",
        onPress: () => {
          setBusy("cancel");
          setError(null);
          reconcileOrderAfterMutation({
            orderId,
            mutate: () => cancelCustomerOrder(orderId),
            getOrder: getCustomerOrder,
            onMutation: (result) => {
              setOrder(result.order);
              setRefundDenied(false);
            },
          })
            .then(({ order: next, reconcileError }) => {
              applyReconciledOrder(next);
              if (reconcileError != null) {
                setError(errorMessage(reconcileError));
              }
            })
            .catch((caught: unknown) => {
              setError(errorMessage(caught));
            })
            .finally(() => {
              setBusy(null);
            });
        },
      },
    ]);
  }, [applyReconciledOrder, busy, orderId]);

  const onRefund = useCallback(() => {
    if (busy || refundDenied) {
      return;
    }

    Alert.alert("Request refund", "Request a refund for this order?", [
      { text: "Not now", style: "cancel" },
      {
        text: "Request refund",
        onPress: () => {
          setBusy("refund");
          setError(null);
          reconcileOrderAfterMutation({
            orderId,
            mutate: () => refundCustomerOrder(orderId),
            getOrder: getCustomerOrder,
            onMutation: (result) => {
              setOrder(result.order);
              setRefund(result.refund);
              setRefundDenied(false);
            },
          })
            .then(({ order: next, reconcileError }) => {
              applyReconciledOrder(next);
              if (reconcileError != null) {
                setError(errorMessage(reconcileError));
              }
            })
            .catch((caught: unknown) => {
              setError(errorMessage(caught));
              if (isRefundClientRejection(caught)) {
                setRefundDenied(true);
              }
            })
            .finally(() => {
              setBusy(null);
            });
        },
      },
    ]);
  }, [applyReconciledOrder, busy, orderId, refundDenied]);

  const header = (
    <StoreProductsHeader
      title="Order Details"
      cartBadgeCount={lineCount}
      onPressBack={() => navigation.goBack()}
      onPressSearch={onPressSearch}
      onPressCart={onPressCart}
    />
  );

  if (shouldShowOrderDetailFullScreenLoader(status, order)) {
    return (
      <View className="flex-1 bg-pillfly-background">
        {header}
        <BouncingDotsLoader />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-pillfly-background">
        {header}
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-[16px] text-pillfly-ink">{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => load()}
            className="mt-4 rounded-xl bg-pillfly-primary px-5 py-3 active:opacity-90"
          >
            <Text className="text-[15px] font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const address = order.shippingAddress;
  const addressLine = [address.addressLine1, address.addressLine2, address.landmark, address.city, address.state]
    .filter((part) => part && part.trim())
    .join(", ");
  const copy = shipmentStatusCopy(order.status);
  const cancelled = isCancelledOrder(order.status);
  const showCancel = canCancelOrder(order.status);
  const summary = shipmentItemSummary(order.items);
  const bill = buildOrderBill(order.items, order.subtotal, order.totalAmount);
  const refundAmount = refund?.amount ?? order.refundAmount;
  const showRefundSummary =
    refund != null ||
    order.refundAmount != null ||
    order.status === "REFUND_PENDING" ||
    order.status === "REFUNDED";
  const refundStatusLabel = refund
    ? formatRefundStatusLabel(refund.status)
    : formatRefundStatusLabel(order.status);
  const showRequestRefund =
    !refundDenied && canRequestRefund(order.status, refund?.status, order.paymentStatus);

  return (
    <View className="flex-1 bg-pillfly-background">
      {header}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-2xl border border-pillfly-line bg-pillfly-surface">
          <View className="flex-row items-start justify-between px-4 pb-3 pt-4">
            <View className="mr-3 flex-1">
              <Text className="text-[11px] font-semibold uppercase text-pillfly-muted">{copy.eyebrow}</Text>
              <Text className="mt-1 text-[18px] font-bold text-pillfly-ink">{copy.title}</Text>
              {cancelled ? (
                <Text className="mt-1 text-[12px] text-pillfly-muted">
                  {formatOrderDateTime(order.updatedAt)}
                </Text>
              ) : null}
            </View>
            <View className="flex-row items-center gap-1.5 pt-1">
              <View
                className={`h-2.5 w-2.5 rounded-full ${
                  copy.badgeTone === "danger"
                    ? "bg-pillfly-promo-red"
                    : copy.badgeTone === "success"
                      ? "bg-[#16A34A]"
                      : "bg-pillfly-muted"
                }`}
              />
              <Text className={`text-[13px] font-bold ${badgeClass(copy.badgeTone)}`}>{copy.badge}</Text>
            </View>
          </View>

          <View className="mx-4 mb-3 rounded-xl bg-[#EEF6F5] px-3 py-3">
            <Text className="text-[13px] text-pillfly-ink">{copy.band}</Text>
          </View>

          {!cancelled ? <View className="px-4 pb-2"><ShipmentTracker status={order.status} /></View> : null}

          <View className="border-t border-pillfly-line px-4 py-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-[13px] text-pillfly-ink">
                  {summary.count} {summary.count === 1 ? "item" : "items"} in this shipment
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-pillfly-muted" numberOfLines={1}>
                  {summary.titles}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[12px] text-pillfly-muted">Amount</Text>
                <Text className="mt-0.5 text-[15px] font-bold text-pillfly-ink">
                  {formatInr(order.totalAmount)}
                </Text>
              </View>
            </View>

            {itemsOpen ? (
              <View key={`items-${catalogTick}`} className="mt-3 gap-3">
                {order.items.map((item) => (
                  <View
                    key={`${item.productId}:${item.variantId}`}
                    className="flex-row items-start gap-3"
                  >
                    <View className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-pillfly-line bg-pillfly-surface">
                      <ProductImageWithPlaceholder uri={itemImage(item)} className="h-full w-full" />
                    </View>
                    <View className="min-w-0 flex-1 justify-center py-0.5">
                      <Text
                        className="text-[14px] font-semibold leading-5 text-pillfly-ink"
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <View className="mt-1.5 flex-row items-center justify-between gap-3">
                        <Text className="text-[13px] text-pillfly-muted">Qty {item.quantity}</Text>
                        <Text className="shrink-0 text-[14px] font-semibold text-pillfly-ink">
                          {formatInr(item.totalPrice)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <View className="mt-3 flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                onPress={() => setItemsOpen((open) => !open)}
                className="flex-1 items-center rounded-full bg-[#1E293B] px-4 py-3 active:opacity-90"
              >
                <Text className="text-[13px] font-bold text-white">
                  {itemsOpen ? "Hide details" : "View details →"}
                </Text>
              </Pressable>
              {showCancel ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={busy != null}
                  onPress={onCancel}
                  className={`flex-1 items-center rounded-full border border-pillfly-line bg-pillfly-surface px-4 py-3 ${
                    busy ? "opacity-60" : "active:opacity-90"
                  }`}
                >
                  <Text className="text-[13px] font-bold text-pillfly-ink">
                    {busy === "cancel" ? "Cancelling..." : "Cancel Shipment"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <Text className="mb-2 mt-5 text-[16px] font-bold text-pillfly-ink">Bill Summary</Text>
        <View className="rounded-2xl border border-pillfly-line bg-pillfly-surface px-4 py-2">
          <BillRow label="MRP" value={formatInr(bill.mrpTotal)} />
          {bill.discountTotal > 0 ? (
            <BillRow label="Discount" value={`- ${formatInr(bill.discountTotal)}`} positive />
          ) : null}
          <View className="border-t border-dashed border-pillfly-line" />
          <BillRow label="Discounted Value" value={formatInr(bill.subtotal)} />
          <View className="border-t border-pillfly-line" />
          <BillRow label="Order Total" value={formatInr(bill.totalAmount)} emphasize />
          <View className="border-t border-pillfly-line" />
          <Text className="pt-3 text-[11px] font-semibold uppercase text-pillfly-muted">Payment Mode</Text>
          <View className="flex-row items-center justify-between pb-2 pt-1">
            <Text className="text-[14px] font-semibold text-pillfly-ink">
              {formatOrderLabel(order.paymentStatus)}
            </Text>
            <Text className="text-[14px] font-semibold text-pillfly-ink">
              {formatInr(order.totalAmount)}
            </Text>
          </View>
          <Text className="pb-3 text-[12px] text-pillfly-muted">{formatOrderDateTime(order.createdAt)}</Text>
          {bill.savings > 0 ? (
            <View className="mb-2 rounded-xl bg-[#ECFDF5] px-3 py-3">
              <Text className="text-center text-[13px] font-semibold text-[#166534]">
                {formatInr(bill.savings)} Saved in this order
              </Text>
            </View>
          ) : null}
        </View>

        {showRefundSummary ? (
          <>
            <Text className="mb-2 mt-5 text-[16px] font-bold text-pillfly-ink">Refund Summary</Text>
            <View className="rounded-2xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] font-bold text-pillfly-ink">Refund Total</Text>
                <Text className="text-[14px] font-bold text-pillfly-ink">
                  {formatInr(refundAmount ?? 0)}
                </Text>
              </View>
              <View className="my-3 border-t border-pillfly-line" />
              <Text className="text-[12px] text-pillfly-muted">Refund status</Text>
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="text-[14px] font-semibold text-pillfly-ink">{refundStatusLabel}</Text>
                {refund?.status === "processed" || order.status === "REFUNDED" ? (
                  <Text className="text-[12px] font-semibold text-[#16A34A]">Successful</Text>
                ) : null}
              </View>
              <Text className="mt-1 text-[12px] text-pillfly-muted">
                {formatOrderDateTime(order.updatedAt)}
              </Text>
            </View>
          </>
        ) : null}

        <Text className="mb-2 mt-5 text-[16px] font-bold text-pillfly-ink">Other Details</Text>
        <View className="rounded-2xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
          <Text className="text-[12px] text-pillfly-muted">Order ID</Text>
          <Text className="mt-1 text-[14px] font-semibold text-pillfly-ink">{order.id}</Text>

          <View className="my-3 border-t border-pillfly-line" />
          <Text className="text-[12px] text-pillfly-muted">Placed On</Text>
          <Text className="mt-1 text-[14px] font-semibold text-pillfly-ink">
            {formatOrderPlacedDetail(order.createdAt)}
          </Text>

          <View className="my-3 border-t border-pillfly-line" />
          <Text className="text-[12px] text-pillfly-muted">Shipping Address</Text>
          <Text className="mt-1 text-[14px] font-semibold text-pillfly-ink">
            {addressLine} {address.postalCode}
          </Text>
          <Text className="mt-1 text-[13px] text-pillfly-muted">{address.phoneNumber}</Text>

          <View className="my-3 border-t border-pillfly-line" />
          <Text className="text-[12px] text-pillfly-muted">Recipient</Text>
          <Text className="mt-1 text-[14px] font-semibold text-pillfly-ink">{address.recipientName}</Text>
        </View>

        {error ? <Text className="mt-4 text-[13px] text-pillfly-ink">{error}</Text> : null}

        {showRequestRefund ? (
          <Pressable
            accessibilityRole="button"
            disabled={busy != null}
            onPress={onRefund}
            className={`mt-4 items-center rounded-xl bg-pillfly-primary px-4 py-3.5 ${
              busy ? "opacity-60" : "active:opacity-90"
            }`}
          >
            <Text className="text-[14px] font-bold text-white">
              {busy === "refund" ? "Requesting refund..." : "Request refund"}
            </Text>
          </Pressable>
        ) : null}

        <View style={{ height: insets.bottom + 90 }} />
      </ScrollView>
    </View>
  );
}
