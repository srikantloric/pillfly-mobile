import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";

import { ProductImageWithPlaceholder } from "@/components/ui";
import { navigateToSharedRoute } from "@/navigation/navigateShared";
import { useCartStore } from "@/features/cart/store/cart.store";
import { productService } from "@/features/product/services/product.service";
import { getProductImageUrl, isHealthcareProduct } from "@/features/product/utils/productDisplay";
import type { ProfileStackParamList } from "@/types/navigation.types";
import { colors } from "@/theme";
import { RequestError } from "@/services/api/requestError";

import { listCustomerOrders } from "../api/order.api";
import type { CustomerOrder, OrderItem } from "../types/order.types";
import { canReorderOrder, formatOrderPlacedOn, formatOrderStatusLabel } from "../utils/orderDisplay";

const VISIBLE_TITLES = 2; 
const VISIBLE_IMAGES = 3;

function appendOrders(current: CustomerOrder[], next: CustomerOrder[]): CustomerOrder[] {
  const seen = new Set(current.map((order) => order.id));
  return [...current, ...next.filter((order) => !seen.has(order.id))];
}

function errorMessage(error: unknown): string {
  return error instanceof RequestError ? error.message : "Something went wrong. Please try again.";
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

function titleLines(items: OrderItem[]): string[] {
  const shown = items.slice(0, VISIBLE_TITLES);
  const extra = items.length - shown.length;

  return shown.map((item, index) => {
    const more = index === shown.length - 1 && extra > 0 ? ` + ${extra} more` : "";
    return `${item.title}${more}`;
  });
}

function reorder(order: CustomerOrder) {
  for (const line of order.items) {
    const existing = useCartStore
      .getState()
      .items.find((item) => item.productId === line.productId && item.variantId === line.variantId);
    const currentQuantity = existing?.quantity ?? 0;
    if (!existing) {
      useCartStore.getState().addItem(line.productId, line.variantId);
    }
    useCartStore.getState().setQuantity(line.productId, currentQuantity + line.quantity, line.variantId);
  }
}

function OrderCard({
  order,
  onPress,
  onReorder,
}: {
  order: CustomerOrder;
  onPress: () => void;
  onReorder: () => void;
}) {
  const images = order.items.slice(0, VISIBLE_IMAGES);

  return (
    <View className="mx-4 mb-4">
      <View className="z-10 -mb-2.5 ml-3 self-start rounded-md border border-pillfly-line bg-pillfly-background px-2 py-1">
        <Text className="text-[11px] font-semibold text-pillfly-muted">
          {formatOrderStatusLabel(order.status)}
        </Text>
      </View>

      <View className="rounded-2xl border border-pillfly-line bg-pillfly-surface px-3 pb-3 pt-4">
        <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-90">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-[15px] font-semibold text-pillfly-ink" numberOfLines={1}>
              {order.shippingAddress.recipientName}
            </Text>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </View>

          <View className="mt-3 flex-row gap-2">
            {images.map((item) => (
              <View
                key={`${item.productId}:${item.variantId}`}
                className="h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-pillfly-line bg-pillfly-surface"
              >
                <ProductImageWithPlaceholder uri={itemImage(item)} className="h-full w-full" />
              </View>
            ))}
          </View>

          <View className="mt-3 gap-1">
            {titleLines(order.items).map((line, index) => (
              <Text key={`${order.id}-title-${index}`} className="text-[13px] text-pillfly-ink">
                {"\u2022"} {line}
              </Text>
            ))}
          </View>
        </Pressable>

        <View className="mt-3 flex-row items-center justify-between border-t border-pillfly-line pt-3">
          <Text className="text-[13px] text-pillfly-ink">Placed On {formatOrderPlacedOn(order.createdAt)}</Text>
          {canReorderOrder(order.status) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Reorder ${order.shippingAddress.recipientName}`}
              onPress={onReorder}
              className="rounded-lg bg-pillfly-primary px-4 py-2 active:opacity-90"
            >
              <Text className="text-[13px] font-bold text-white">Reorder</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
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

  const onReorder = useCallback(
    (order: CustomerOrder) => {
      reorder(order);
      navigateToSharedRoute(navigation as NavigationProp<ParamListBase>, "Cart");
    },
    [navigation],
  );

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
      contentContainerClassName={orders.length === 0 ? "flex-1" : "pt-4"}
      data={orders}
      keyExtractor={(order) => order.id}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[18px] font-bold text-pillfly-ink">No orders yet</Text>
        </View>
      }
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
          onReorder={() => onReorder(item)}
        />
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
