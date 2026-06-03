import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchBar } from "../../components/search";
import { MOCK_CART_SUMMARY } from "../../mocks/search.mock";
import { navigateToSharedRoute } from "../../navigation/navigateShared";
import type { SearchStackParamList } from "../../types/navigation.types";
import type { MedicineProduct, Product } from "../../types/product";
import { colors } from "../../theme";

import {
  formatInr,
  getDiscountPercent,
  getProductImageUrl,
  getProductMrp,
  getResultsForSearch,
  getUnitPriceLabel,
  isMedicineProduct,
} from "./search.utils";

type Props = NativeStackScreenProps<SearchStackParamList, "SearchResults">;

type ResultFilter = "all" | "substitute";

const GRID_GAP = 12;
const GRID_PADDING = 16;

function ResultProductCard({
  product,
  width,
  onPress,
}: {
  product: Product;
  width: number;
  onPress: () => void;
}) {
  const imageUrl = getProductImageUrl(product);
  const mrp = getProductMrp(product);
  const discount = getDiscountPercent(product);
  const isRx = isMedicineProduct(product) && product.isPrescriptionRequired;
  const salePrice =
    mrp != null && discount != null && discount > 0
      ? mrp * (1 - discount / 100)
      : mrp;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ width }}
      className="mb-3 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface active:opacity-95"
    >
      <View className="relative h-[120px] items-center justify-center bg-pillfly-background px-2 pt-2">
        {isRx ? (
          <View className="absolute right-2 top-2 z-10 rounded bg-pillfly-muted/20 px-1.5 py-0.5">
            <Text className="text-[10px] font-bold text-pillfly-muted">Rx</Text>
          </View>
        ) : null}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="contain" />
        ) : (
          <Feather name="package" size={32} color={colors.textSecondary} />
        )}
      </View>
      <View className="px-2.5 pb-3 pt-2">
        <Text className="text-[13px] font-bold leading-[18px] text-pillfly-ink" numberOfLines={3}>
          {product.title}
        </Text>
        {salePrice != null ? (
          <Text className="mt-1.5 text-[14px] font-bold text-pillfly-ink">
            {formatInr(salePrice)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function ComparisonCard({
  product,
  highlighted,
  savingsLabel,
}: {
  product: MedicineProduct;
  highlighted?: boolean;
  savingsLabel?: string;
}) {
  const mrp = product.mrp;
  const discount = product.discount ?? 22;
  const salePrice = mrp * (1 - discount / 100);
  const imageUrl = getProductImageUrl(product);
  const unitLabel = getUnitPriceLabel(product);

  return (
    <View
      className={`relative flex-1 overflow-hidden rounded-xl border p-2.5 ${
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
      <View className={`items-center ${savingsLabel ? "mt-6" : ""}`}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-16 w-16" resizeMode="contain" />
        ) : null}
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
        className={`mt-2 items-center rounded-lg py-2 ${
          highlighted ? "bg-pillfly-primary" : "border border-pillfly-primary"
        }`}
      >
        <Text
          className={`text-[12px] font-bold ${
            highlighted ? "text-white" : "text-pillfly-primary"
          }`}
        >
          Add To Cart
        </Text>
      </Pressable>
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
    const parent = navigation.getParent();
    if (parent) {
      navigateToSharedRoute(parent, "Cart");
    }
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ResultProductCard
        product={item}
        width={cardWidth}
        onPress={() => {}}
      />
    ),
    [cardWidth],
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
            <ComparisonCard product={comparisonPair[0]} />
            <View className="items-center justify-center">
              <View className="rounded-full bg-pillfly-surface px-2 py-1">
                <Text className="text-[10px] font-bold text-pillfly-muted">VS</Text>
              </View>
            </View>
            <ComparisonCard
              product={comparisonPair[1]}
              highlighted
              savingsLabel="67% SAVINGS"
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
        }}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 88,
          gap: GRID_GAP,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t border-pillfly-line bg-pillfly-surface px-4 py-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View>
          <Text className="text-[14px] font-bold text-pillfly-ink">
            {MOCK_CART_SUMMARY.itemCount} items
          </Text>
          <Text className="text-[12px] text-pillfly-muted">{MOCK_CART_SUMMARY.label}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View cart"
          onPress={onViewCart}
          className="flex-row items-center gap-2 rounded-xl bg-pillfly-primary px-5 py-3 active:opacity-90"
        >
          <Text className="text-[15px] font-bold text-white">View Cart</Text>
          <Feather name="shopping-cart" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
