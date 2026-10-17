import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View, useWindowDimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CART_STICKY_BAR_SCROLL_PADDING, CartStickyBar } from "@/features/cart";
import { SearchBar, SearchHitCard } from "@/features/search/components";
import { PrimaryButton } from "@/components/ui";
import { useCartSummary } from "@/features/cart";
import { useProductSearch } from "@/features/product/hooks/useProductSearch";
import { navigateToSharedRoute } from "@/navigation/navigateShared";
import type { ProductSearchHit } from "@/features/product/types/storeProduct";
import type { SearchStackParamList } from "@/types/navigation.types";
import { colors } from "@/theme";

type Props = NativeStackScreenProps<SearchStackParamList, "SearchResults">;

const GRID_GAP = 12;
const GRID_PADDING = 16;

export function SearchResultsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [query, setQuery] = useState(route.params.query);
  const searchQuery = route.params.query;
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry,
  } = useProductSearch(searchQuery);

  useEffect(() => {
    setQuery(route.params.query);
  }, [route.params.query]);

  const cardWidth = useMemo(() => {
    const inner = windowWidth - GRID_PADDING * 2 - GRID_GAP;
    return Math.floor(inner / 2);
  }, [windowWidth]);

  const goToResults = useCallback(
    (searchQueryValue: string) => {
      const q = searchQueryValue.trim();
      if (!q) {
        return;
      }
      navigation.setParams({ query: q, categoryId: undefined });
      setQuery(q);
    },
    [navigation],
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onViewCart = useCallback(() => {
    navigateToSharedRoute(navigation, "Cart");
  }, [navigation]);

  const { itemCount, stickyLabel } = useCartSummary();

  const onOpenProduct = useCallback(
    (hit: ProductSearchHit) => {
      navigation.getParent()?.navigate("ProductDetail", { productId: hit.productId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ProductSearchHit }) => (
      <SearchHitCard hit={item} width={cardWidth} onPress={onOpenProduct} />
    ),
    [cardWidth, onOpenProduct],
  );

  const listHeader = (
    <View className="flex-row items-center gap-1 px-4 pb-2 pt-1">
      <Feather name="zap" size={14} color={colors.primary} />
      <Text className="text-[12px] text-pillfly-muted">
        Express delivery to <Text className="font-bold text-pillfly-ink">400001 Mumbai</Text>
      </Text>
    </View>
  );

  const listEmpty = (
    <View className="items-center px-4 py-8">
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : error ? (
        <>
          <Text className="text-center text-[14px] text-pillfly-promo-red">{error.message}</Text>
          <View className="mt-4 w-40">
            <PrimaryButton label="Retry" onPress={retry} />
          </View>
        </>
      ) : (
        <>
          <Text className="text-[16px] font-bold text-pillfly-ink">No products found</Text>
          <Text className="mt-1 text-center text-[14px] text-pillfly-muted">
            Try a different search term.
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-pillfly-background" style={{ paddingTop: insets.top }}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onBack={onBack}
        onClear={() => setQuery("")}
        onSubmit={() => goToResults(query)}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={
          items.length > 0
            ? {
                gap: GRID_GAP,
                paddingHorizontal: GRID_PADDING,
                alignItems: "stretch",
              }
            : undefined
        }
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{
          paddingBottom: insets.bottom + CART_STICKY_BAR_SCROLL_PADDING,
          gap: GRID_GAP,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {itemCount > 0 ? (
        <CartStickyBar itemCount={itemCount} label={stickyLabel} onPressViewCart={onViewCart} />
      ) : null}
    </View>
  );
}
