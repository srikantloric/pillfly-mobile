import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, Text, View, useWindowDimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedHeaderNavigation } from "@/components/header";
import { BouncingDotsLoader, PrimaryButton } from "@/components/ui";
import { useCartSummary } from "@/features/cart";
import { StoreProductCard } from "@/features/product/components/StoreProductCard";
import { StoreProductsHeader } from "@/features/product/components/StoreProductsHeader";
import { useProducts } from "@/features/product/hooks/useProducts";
import type { Product } from "@/features/product/types/product";
import type { AppStackParamList } from "@/types/navigation.types";
import { colors } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "StoreProducts">;

const GRID_GAP = 12;
const GRID_PADDING = 16;

export function StoreProductsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { products, loading, loadingMore, error, hasMore, loadMore, retry } = useProducts();
  const { lineCount } = useCartSummary();
  const { onPressSearch, onPressCart } = useSharedHeaderNavigation(navigation);

  const cardWidth = useMemo(() => {
    const inner = windowWidth - GRID_PADDING * 2 - GRID_GAP;
    return Math.floor(inner / 2);
  }, [windowWidth]);

  const onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onOpenProduct = useCallback(
    (product: Product) => {
      navigation.navigate("ProductDetail", { productId: product.id });
    },
    [navigation],
  );

  const onEndReached = useCallback(() => {
    if (!hasMore || loading || loadingMore || error) {
      return;
    }
    loadMore();
  }, [error, hasMore, loadMore, loading, loadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <StoreProductCard product={item} width={cardWidth} onPress={() => onOpenProduct(item)} />
    ),
    [cardWidth, onOpenProduct],
  );

  const listEmpty = (
    <View className="flex-1 items-center justify-center px-6 py-8">
      {error ? (
        <View className="w-full rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-5">
          <Text className="text-center text-[14px] text-pillfly-promo-red">{error.message}</Text>
          <View className="mt-4">
            <PrimaryButton label="Retry" accessibilityLabel="Retry loading products" onPress={retry} />
          </View>
        </View>
      ) : (
        <>
          <Text className="text-[16px] font-bold text-pillfly-ink">No products available</Text>
          <Text className="mt-1 text-center text-[14px] text-pillfly-muted">
            Please check back later.
          </Text>
        </>
      )}
    </View>
  );

  const showPageError = products.length > 0 && error != null && !loadingMore;
  const listFooter =
    loadingMore || showPageError ? (
      <View className="items-center px-6 py-4">
        {loadingMore ? <ActivityIndicator color={colors.primary} /> : null}
        {showPageError ? (
          <View className="w-full items-center">
            <Text className="text-center text-[14px] text-pillfly-promo-red">{error.message}</Text>
            <View className="mt-3 w-40">
              <PrimaryButton
                label="Retry"
                accessibilityLabel="Retry loading more products"
                onPress={loadMore}
              />
            </View>
          </View>
        ) : null}
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-pillfly-background">
      <StoreProductsHeader
        title="Medicine"
        cartBadgeCount={lineCount}
        onPressBack={onPressBack}
        onPressSearch={onPressSearch}
        onPressCart={onPressCart}
      />

      {loading && products.length === 0 ? (
        <BouncingDotsLoader />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={
            products.length > 0
              ? {
                  gap: GRID_GAP,
                  paddingHorizontal: GRID_PADDING,
                  alignItems: "stretch",
                }
              : undefined
          }
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{
            paddingTop: GRID_GAP,
            paddingBottom: insets.bottom + 24,
            gap: GRID_GAP,
            flexGrow: products.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
