import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";

import { BouncingDotsLoader, ProductImageWithPlaceholder } from "@/components/ui";
import { navigateToSharedRoute } from "@/navigation/navigateShared";
import { useCartStore } from "@/features/cart/store/cart.store";
import { productService } from "@/features/product/services/product.service";
import { getProductImageUrl, isHealthcareProduct } from "@/features/product/utils/productDisplay";
import type { ProfileStackParamList } from "@/types/navigation.types";
import { colors } from "@/theme";
import { toCustomerMessage } from "@/utils/customerMessage";

import { listCustomerOrders } from "../api/order.api";
import type { CustomerOrder, OrderItem } from "../types/order.types";
import { canReorderOrder, formatOrderPlacedOn, formatOrderStatusLabel } from "../utils/orderDisplay";
import {
  planOrdersRefresh,
  shouldShowOrdersFullScreenLoader,
  type OrdersRefreshKind,
} from "../utils/orderRefresh";
import { prepareReorder, type ReorderAddition } from "../utils/reorderAvailability";

const VISIBLE_TITLES = 2; 
const VISIBLE_IMAGES = 3;

function appendOrders(current: CustomerOrder[], next: CustomerOrder[]): CustomerOrder[] {
  const seen = new Set(current.map((order) => order.id));
  return [...current, ...next.filter((order) => !seen.has(order.id))];
}

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

function titlePreview(items: OrderItem[]): { titles: string[]; extra: number } {
  const shown = items.slice(0, VISIBLE_TITLES);
  return {
    titles: shown.map((item) => item.title),
    extra: Math.max(0, items.length - shown.length),
  };
}

function applyReorderAdditions(additions: readonly ReorderAddition[]): void {
  for (const line of additions) {
    const existing = useCartStore
      .getState()
      .items.some((item) => item.productId === line.productId && item.variantId === line.variantId);
    if (existing) {
      continue;
    }

    useCartStore.getState().addItem(line.productId, line.variantId);
    useCartStore.getState().setQuantity(line.productId, line.quantity, line.variantId);
  }
}

function OrderCard({
  order,
  onPress,
  onReorder,
  reorderDisabled,
  reordering,
}: {
  order: CustomerOrder;
  onPress: () => void;
  onReorder: () => void;
  reorderDisabled: boolean;
  reordering: boolean;
}) {
  const images = order.items.slice(0, VISIBLE_IMAGES);
  const preview = titlePreview(order.items);

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
            {preview.titles.map((title, index) => (
              <View key={`${order.id}-title-${index}`} className="flex-row items-start gap-1.5">
                <Text className="text-[13px] leading-5 text-pillfly-ink">{"\u2022"}</Text>
                <Text
                  className="min-w-0 flex-1 text-[13px] leading-5 text-pillfly-ink"
                  numberOfLines={1}
                >
                  {title}
                </Text>
              </View>
            ))}
            {preview.extra > 0 ? (
              <Text className="pl-4 text-[12px] text-pillfly-muted">+ {preview.extra} more</Text>
            ) : null}
          </View>
        </Pressable>

        <View className="mt-3 flex-row items-center justify-between border-t border-pillfly-line pt-3">
          <Text className="text-[13px] text-pillfly-ink">Placed On {formatOrderPlacedOn(order.createdAt)}</Text>
          {canReorderOrder(order.status) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Reorder ${order.shippingAddress.recipientName}`}
              accessibilityState={{ disabled: reorderDisabled }}
              disabled={reorderDisabled}
              onPress={onReorder}
              className={`rounded-lg bg-pillfly-primary px-4 py-2 ${
                reorderDisabled ? "opacity-60" : "active:opacity-90"
              }`}
            >
              <Text className="text-[13px] font-bold text-white">{reordering ? "Checking..." : "Reorder"}</Text>
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
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogTick, setCatalogTick] = useState(0);
  const [refreshKind, setRefreshKind] = useState<OrdersRefreshKind>("initial");
  const skipNextFocusRefresh = useRef(true);

  const load = useCallback((kind: OrdersRefreshKind = "initial", nextCursor?: string) => {
    const plan = planOrdersRefresh(kind, nextCursor);
    setRefreshKind(kind);

    if (plan.loadingMore) {
      setLoadingMore(true);
    } else if (plan.fullScreenLoader) {
      setStatus("loading");
    }

    return listCustomerOrders(plan.cursor ? { cursor: plan.cursor } : {})
      .then((page) => {
        setOrders((current) => (plan.replaceList ? page.data : appendOrders(current, page.data)));
        setCursor(page.nextCursor);
        setStatus("ready");
        setError(null);
        const productIds = page.data.flatMap((order) => order.items.map((item) => item.productId));
        void productService.ensureProductsByIds(productIds).then(() => {
          setCatalogTick((current) => current + 1);
        });
      })
      .catch((caught: unknown) => {
        setError(errorMessage(caught));
        if (plan.fullScreenLoader) {
          setStatus("error");
        }
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, []);

  useEffect(() => {
    load("initial");
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (skipNextFocusRefresh.current) {
        skipNextFocusRefresh.current = false;
        return;
      }

      void load("focus");
    }, [load]),
  );

  const openCart = useCallback(() => {
    navigateToSharedRoute(navigation as NavigationProp<ParamListBase>, "Cart");
  }, [navigation]);

  const onReorder = useCallback(
    (order: CustomerOrder) => {
      if (reorderingId) {
        return;
      }

      setReorderingId(order.id);
      const items = order.items;
      setTimeout(() => {
        prepareReorder(items, useCartStore.getState().items)
          .then((plan) => {
            applyReorderAdditions(plan.additions);
            if (plan.notices.length > 0) {
              Alert.alert("Reorder", plan.notices.join("\n"), [
                {
                  text: "OK",
                  onPress: () => {
                    if (plan.openCart) {
                      openCart();
                    }
                  },
                },
              ]);
              return;
            }

            if (plan.openCart) {
              openCart();
            }
          })
          .catch(() => {
            Alert.alert("Reorder", "Couldn't check these items. Nothing was added.");
          })
          .finally(() => {
            setReorderingId(null);
          });
      }, 0);
    },
    [openCart, reorderingId],
  );

  if (shouldShowOrdersFullScreenLoader(status, refreshKind)) {
    return <BouncingDotsLoader />;
  }

  if (status === "error") {
    return (
      <View className="flex-1 items-center justify-center bg-pillfly-background px-8">
        <Text className="text-center text-[16px] text-pillfly-ink">{error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => load("initial")}
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
      extraData={catalogTick}
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
          reorderDisabled={reorderingId != null}
          reordering={reorderingId === item.id}
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
                onPress={() => load("more", cursor)}
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
