import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { ProfileStackParamList } from "@/types/navigation.types";
import { formatInr } from "@/features/product/utils/productDisplay";
import { RequestError } from "@/services/api/requestError";

import { listCustomerOrders } from "../api/order.api";
import type { CustomerOrder } from "../types/order.types";
import { formatOrderDate, formatOrderLabel } from "../utils/orderDisplay";

function appendOrders(current: CustomerOrder[], next: CustomerOrder[]): CustomerOrder[] {
  const seen = new Set(current.map((order) => order.id));
  return [...current, ...next.filter((order) => !seen.has(order.id))];
}

function errorMessage(error: unknown): string {
  return error instanceof RequestError ? error.message : "Something went wrong. Please try again.";
}

export function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((nextCursor?: string) => {
    if (nextCursor) {
      setLoadingMore(true);
    } else {
      setStatus("loading");
    }

    return listCustomerOrders(nextCursor ? { cursor: nextCursor } : {})
      .then((page) => {
        setOrders((current) => (nextCursor ? appendOrders(current, page.data) : page.data));
        setCursor(page.nextCursor);
        setStatus("ready");
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(errorMessage(caught));
        if (!nextCursor) {
          setStatus("error");
        }
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-pillfly-background px-8">
        <Text className="text-[18px] font-bold text-pillfly-ink">Loading orders</Text>
      </View>
    );
  }

  if (status === "error") {
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

  return (
    <FlatList
      className="flex-1 bg-pillfly-background"
      contentContainerClassName={orders.length === 0 ? "flex-1" : "py-4"}
      data={orders}
      keyExtractor={(order) => order.id}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[18px] font-bold text-pillfly-ink">No orders yet</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
          className="mx-4 mb-3 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3 active:opacity-90"
        >
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-[14px] font-bold text-pillfly-ink" numberOfLines={1}>
              {item.id}
            </Text>
            <Text className="text-[14px] font-bold text-pillfly-ink">{formatInr(item.totalAmount)}</Text>
          </View>
          <Text className="mt-1 text-[13px] text-pillfly-muted">{formatOrderDate(item.createdAt)}</Text>
          <Text className="mt-2 text-[13px] font-semibold text-pillfly-ink">
            {formatOrderLabel(item.status)}
          </Text>
        </Pressable>
      )}
      ListFooterComponent={
        cursor || error ? (
          <View className="px-4 pb-4">
            {error ? <Text className="mb-3 text-[13px] text-pillfly-ink">{error}</Text> : null}
            {cursor ? (
              <Pressable
                accessibilityRole="button"
                disabled={loadingMore}
                onPress={() => load(cursor)}
                className={`items-center rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3 ${
                  loadingMore ? "opacity-60" : "active:opacity-90"
                }`}
              >
                <Text className="text-[14px] font-bold text-pillfly-ink">
                  {loadingMore ? "Loading more..." : "Load more"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null
      }
    />
  );
}
