import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BouncingDotsLoader } from "@/components/ui";
import type { ProfileStackParamList } from "@/types/navigation.types";
import { formatInr } from "@/features/product/utils/productDisplay";
import { toCustomerMessage } from "@/utils/customerMessage";

import { cancelCustomerOrder, getCustomerOrder, refundCustomerOrder } from "../api/order.api";
import type { CustomerOrder, OrderRefund } from "../types/order.types";
import {
  buildOrderTimeline,
  formatOrderDate,
  formatOrderLabel,
  formatOrderStatusLabel,
  type TimelineStepState,
} from "../utils/orderDisplay";

type Props = NativeStackScreenProps<ProfileStackParamList, "OrderDetail">;

function errorMessage(error: unknown): string {
  return toCustomerMessage(error);
}

function stepTextClass(state: TimelineStepState): string {
  if (state === "pending") {
    return "text-[14px] text-pillfly-muted";
  }

  if (state === "current") {
    return "text-[14px] font-bold text-pillfly-ink";
  }

  return "text-[14px] font-semibold text-pillfly-ink";
}

function OrderStatusTimeline({ status }: { status: string }) {
  const timeline = buildOrderTimeline(status);

  if (timeline.kind === "single") {
    return (
      <View className="mt-4 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
        <Text
          className={`text-[14px] font-bold ${
            timeline.tone === "cancelled" ? "text-pillfly-promo-red" : "text-pillfly-ink"
          }`}
        >
          {timeline.label}
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
      {timeline.steps.map((step, index) => {
        const last = index === timeline.steps.length - 1;
        const next = timeline.steps[index + 1];
        const lineReached = step.state !== "pending" && next?.state !== "pending";

        return (
          <View key={step.status} className="flex-row">
            <View className="mr-3 w-4 items-center">
              <View
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  step.state === "pending" ? "border border-pillfly-line bg-pillfly-surface" : "bg-pillfly-primary"
                }`}
              />
              {last ? null : (
                <View className={`mt-1 h-6 w-px ${lineReached ? "bg-pillfly-primary" : "bg-pillfly-line"}`} />
              )}
            </View>
            <Text className={`${stepTextClass(step.state)} ${last ? "" : "mb-3"}`}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [refund, setRefund] = useState<OrderRefund | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"cancel" | "refund" | null>(null);

  const load = useCallback(() => {
    setStatus("loading");
    setError(null);
    return getCustomerOrder(orderId)
      .then((next) => {
        setOrder(next);
        setStatus("ready");
      })
      .catch((caught: unknown) => {
        setError(errorMessage(caught));
        setStatus("error");
      });
  }, [orderId]);

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
          cancelCustomerOrder(orderId)
            .then((result) => {
              setOrder(result.order);
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
  }, [busy, orderId]);

  const onRefund = useCallback(() => {
    if (busy) {
      return;
    }

    Alert.alert("Request refund", "Request a refund for this order?", [
      { text: "Not now", style: "cancel" },
      {
        text: "Request refund",
        onPress: () => {
          setBusy("refund");
          setError(null);
          refundCustomerOrder(orderId)
            .then((result) => {
              setOrder(result.order);
              setRefund(result.refund);
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
  }, [busy, orderId]);

  if (status === "loading" && !order) {
    return <BouncingDotsLoader />;
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-pillfly-background px-8">
        <Text className="text-center text-[16px] text-pillfly-ink">{error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => load()}
          className="mt-4 rounded-xl bg-pillfly-primary px-5 py-3 active:opacity-90"
        >
          <Text className="text-[15px] font-bold text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const address = order.shippingAddress;
  const addressLine = [address.addressLine1, address.addressLine2, address.landmark, address.city, address.state]
    .filter((part) => part && part.trim())
    .join(", ");

  return (
    <ScrollView className="flex-1 bg-pillfly-background" contentContainerClassName="px-4 py-4">
      <View className="rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
        <Text className="text-[14px] font-bold text-pillfly-ink">{order.id}</Text>
        <Text className="mt-1 text-[13px] text-pillfly-muted">{formatOrderDate(order.createdAt)}</Text>
        <Text className="mt-2 text-[14px] font-semibold text-pillfly-ink">
          {formatOrderStatusLabel(order.status)}
        </Text>
        <Text className="mt-1 text-[13px] text-pillfly-muted">
          Payment {formatOrderLabel(order.paymentStatus)}
        </Text>
      </View>

      <OrderStatusTimeline status={order.status} />

      <View className="mt-4 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
        {order.items.map((item) => (
          <View
            key={`${item.productId}:${item.variantId}`}
            className="border-b border-pillfly-line px-4 py-3"
          >
            <Text className="text-[14px] font-bold text-pillfly-ink">{item.title}</Text>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-[13px] text-pillfly-muted">Qty {item.quantity}</Text>
              <Text className="text-[14px] font-semibold text-pillfly-ink">{formatInr(item.totalPrice)}</Text>
            </View>
          </View>
        ))}
        <View className="px-4 py-3">
          <View className="flex-row items-center justify-between py-1">
            <Text className="text-[14px] text-pillfly-muted">Subtotal</Text>
            <Text className="text-[14px] font-semibold text-pillfly-ink">{formatInr(order.subtotal)}</Text>
          </View>
          <View className="flex-row items-center justify-between py-1">
            <Text className="text-[14px] font-bold text-pillfly-ink">Amount to be paid</Text>
            <Text className="text-[14px] font-bold text-pillfly-ink">{formatInr(order.totalAmount)}</Text>
          </View>
        </View>
      </View>

      <View className="mt-4 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
        <Text className="text-[14px] font-bold text-pillfly-ink">{address.recipientName}</Text>
        <Text className="mt-1 text-[13px] text-pillfly-muted">{address.phoneNumber}</Text>
        <Text className="mt-1 text-[13px] text-pillfly-muted">
          {addressLine} {address.postalCode}
        </Text>
      </View>

      {refund ? (
        <View className="mt-4 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
          <Text className="text-[14px] font-bold text-pillfly-ink">
            Refund {formatOrderLabel(refund.status)}
          </Text>
          <Text className="mt-1 text-[13px] text-pillfly-muted">
            {formatInr(refund.amount)} {refund.currency}
          </Text>
        </View>
      ) : order.refundAmount != null ? (
        <View className="mt-4 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
          <Text className="text-[14px] font-semibold text-pillfly-ink">
            Refund amount {formatInr(order.refundAmount)}
          </Text>
        </View>
      ) : null}

      {error ? <Text className="mt-4 text-[13px] text-pillfly-ink">{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy != null}
        onPress={onCancel}
        className={`mt-4 items-center rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3.5 ${
          busy ? "opacity-60" : "active:opacity-90"
        }`}
      >
        <Text className="text-[14px] font-bold text-pillfly-ink">
          {busy === "cancel" ? "Cancelling..." : "Cancel order"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={busy != null}
        onPress={onRefund}
        className={`mt-3 items-center rounded-xl bg-pillfly-primary px-4 py-3.5 ${
          busy ? "opacity-60" : "active:opacity-90"
        }`}
      >
        <Text className="text-[14px] font-bold text-white">
          {busy === "refund" ? "Requesting refund..." : "Request refund"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
