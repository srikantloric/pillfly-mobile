import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CART_STICKY_BAR_SCROLL_PADDING, CartStickyBar } from "@/components/cart";
import {
  ProductImageWithPlaceholder,
  SearchBar,
  SearchResultProductCard,
} from "@/features/search/components";
import { PrimaryButton, OutlineButton } from "@/components/ui";
import { useCartActions, useCartSummary } from "@/features/cart";
import { navigateToSharedRoute } from "@/navigation/navigateShared";
import type { SearchStackParamList } from "@/types/navigation.types";
import type { MedicineProduct, Product } from "@/features/product";
import { colors } from "@/theme";

import {
  formatInr,
  getProductImageUrl,
  getProductPricing,
  getResultsForSearch,
  getUnitPriceLabel,
  isMedicineProduct,
} from "@/features/search/utils/search.utils";

type Props = NativeStackScreenProps<SearchStackParamList, "SearchResults">;

type ResultFilter = "all" | "substitute";

const GRID_GAP = 12;
const GRID_PADDING = 16;

function ComparisonCard({
  product,
  highlighted,
  savingsLabel,
  onAddToCart,
}: {
  product: MedicineProduct;
  highlighted?: boolean;
  savingsLabel?: string;
  onAddToCart: (product: Product) => void;
}) {
  const pricing = getProductPricing(product);
  const mrp = pricing?.mrp ?? product.mrp;
  const discount = pricing?.discountPercent ?? 22;
  const salePrice = pricing?.salePrice ?? product.mrp;
  const imageUrl = getProductImageUrl(product);
  const unitLabel = getUnitPriceLabel(product);

  return (
    <View
      className={`relative flex-1 flex-col overflow-hidden rounded-xl border p-2.5 ${
        highlighted
          ? "border-blue-400 bg-blue-50"
          : "border-pillfly-line bg-pillfly-surface"
      }`}
    >
      {savingsLabel ? (
        <View className="absolute left-0 right-0 top-0 z-10 items-center bg-red-600 py-1">
          <Text className="text-[10px] font-bold text-white">{savingsLabel}</Text>
        </View>
      ) : null}

      <View className="flex-1">
        <View className={`items-center ${savingsLabel ? "mt-6" : ""}`}>
          <ProductImageWithPlaceholder uri={imageUrl} className="h-16 w-16" />
          {product.isPrescriptionRequired ? (
            <Text className="absolute right-1 top-6 text-[10px] font-bold text-pillfly-muted">
              Rx
            </Text>
          ) : null}
        </View>
        <Text className="mt-2 text-[12px] font-bold text-pillfly-ink" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="mt-0.5 text-[10px] text-pillfly-muted">
          {product.medicineDetails.packSize}
        </Text>
        <Text className="mt-1 text-[10px] text-pillfly-muted" numberOfLines={1}>
          {product.medicineDetails.manufacturer}
        </Text>
        <Text className="mt-1 text-[11px] text-pillfly-muted line-through">
          {formatInr(mrp)}
        </Text>
        <Text className="text-[14px] font-bold text-pillfly-ink">{formatInr(salePrice)}</Text>
        <Text className="text-[11px] font-semibold text-red-600">{discount}% OFF</Text>
        {unitLabel ? (
          <View className="mt-1 self-start rounded bg-pillfly-line/50 px-1.5 py-0.5">
            <Text className="text-[9px] text-pillfly-muted">{unitLabel}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-2">
        {highlighted ? (
          <PrimaryButton
            label="Add To Cart"
            size="sm"
            accessibilityLabel="Add to cart"
            onPress={() => onAddToCart(product)}
            className="w-full rounded-lg"
          />
        ) : (
          <OutlineButton
            label="Add To Cart"
            size="sm"
            accessibilityLabel="Add to cart"
            onPress={() => onAddToCart(product)}
            className="w-full rounded-lg"
          />
        )}
      </View>
    </View>
  );
}

export function SearchResultsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [query, setQuery] = useState(route.params.query);
  const [activeFilter, setActiveFilter] = useState<ResultFilter>("all");

  useEffect(() => {
    setQuery(route.params.query);
  }, [route.params.query]);

  const cardWidth = useMemo(() => {
    const inner = windowWidth - GRID_PADDING * 2 - GRID_GAP;
    return Math.floor(inner / 2);
  }, [windowWidth]);

  const allResults = useMemo(
    () =>
      getResultsForSearch({
        query: route.params.query,
        categoryId: route.params.categoryId,
      }),
    [route.params.categoryId, route.params.query],
  );

  const filteredResults = useMemo(() => {
    if (activeFilter === "substitute") {
      return allResults.filter(
        (p) => isMedicineProduct(p) && (p.discount ?? 0) >= 0,
      );
    }
    return allResults;
  }, [activeFilter, allResults]);

  const medicineResults = useMemo(
    () => filteredResults.filter(isMedicineProduct),
    [filteredResults],
  );

  const comparisonPair = useMemo((): [MedicineProduct, MedicineProduct] | null => {
    if (medicineResults.length < 2) {
      return null;
    }
    return [medicineResults[0], medicineResults[1]];
  }, [medicineResults]);

  const goToResults = useCallback(
    (searchQuery: string) => {
      const q = searchQuery.trim();
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
  const { addToCart } = useCartActions();

  const showFeatureComingSoon = useCallback(() => {
    Alert.alert("Coming soon", "This feature will be available soon.", [
      { text: "OK" },
    ]);
  }, []);

  const onAddToCart = useCallback(
    (cartProduct: Product) => {
      addToCart(cartProduct.id);
    },
    [addToCart],
  );

  const onNotify = useCallback(
    (_product: Product) => {
      showFeatureComingSoon();
    },
    [showFeatureComingSoon],
  );

  const onOpenProduct = useCallback(
    (product: Product) => {
      navigation.getParent()?.navigate("ProductDetail", { productId: product.id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <SearchResultProductCard
        product={item}
        width={cardWidth}
        onPress={() => onOpenProduct(item)}
        onAddToCart={onAddToCart}
        onNotify={onNotify}
      />
    ),
    [cardWidth, onAddToCart, onNotify, onOpenProduct],
  );

  const listHeader = (
    <>
      <View className="flex-row items-center gap-1 px-4 pb-2 pt-1">
        <Feather name="zap" size={14} color={colors.primary} />
        <Text className="text-[12px] text-pillfly-muted">
          Express delivery to{" "}
          <Text className="font-bold text-pillfly-ink">400001 Mumbai</Text>
        </Text>
        <Feather name="chevron-down" size={14} color={colors.textSecondary} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 pb-3"
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveFilter("all")}
          className={`rounded-full px-4 py-2 ${
            activeFilter === "all" ? "bg-pillfly-ink" : "border border-pillfly-line bg-pillfly-surface"
          }`}
        >
          <Text
            className={`text-[13px] font-semibold ${
              activeFilter === "all" ? "text-white" : "text-pillfly-ink"
            }`}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveFilter("substitute")}
          className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
            activeFilter === "substitute"
              ? "border-pillfly-primary bg-teal-50"
              : "border-pillfly-primary bg-pillfly-surface"
          }`}
        >
          <Feather name="refresh-cw" size={14} color={colors.primary} />
          <Text className="text-[13px] font-semibold text-pillfly-primary">
            Branded Substitute
          </Text>
        </Pressable>
      </ScrollView>

      {comparisonPair && activeFilter === "all" ? (
        <View className="mx-4 mb-4 overflow-hidden rounded-xl bg-amber-50 px-3 py-3">
          <View className="mb-3 flex-row items-center justify-center gap-2">
            <Text className="text-[13px] font-bold text-amber-900">
              Same composition • Extra saving
            </Text>
          </View>
          <View className="flex-row items-stretch gap-2">
            <ComparisonCard product={comparisonPair[0]} onAddToCart={onAddToCart} />
            <View className="items-center justify-center">
              <View className="rounded-full bg-pillfly-surface px-2 py-1">
                <Text className="text-[10px] font-bold text-pillfly-muted">VS</Text>
              </View>
            </View>
            <ComparisonCard
              product={comparisonPair[1]}
              highlighted
              savingsLabel="67% SAVINGS"
              onAddToCart={onAddToCart}
            />
          </View>
        </View>
      ) : null}   

      {filteredResults.length === 0 ? (
        <View className="items-center px-4 py-8">
          <Text className="text-[16px] font-bold text-pillfly-ink">No products found</Text>
          <Text className="mt-1 text-center text-[14px] text-pillfly-muted">
            Try a different search term or browse categories from search home.
          </Text>
        </View>
      ) : null}
    </>
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
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{
          gap: GRID_GAP,
          paddingHorizontal: GRID_PADDING,
          alignItems: "stretch",
        }}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{
          paddingBottom: insets.bottom + CART_STICKY_BAR_SCROLL_PADDING,
          gap: GRID_GAP,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {itemCount > 0 ? (
        <CartStickyBar
          itemCount={itemCount}
          label={stickyLabel}
          onPressViewCart={onViewCart}
        />
      ) : null}
    </View>
  );
}
