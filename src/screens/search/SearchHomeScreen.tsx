import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomePromoBanner } from "../../components/home/HomePromoBanner";
import { ProductListRow } from "../../components/product";
import { ShopTile } from "../../components/category/ShopTile";
import { ProductImageWithPlaceholder, SearchBar } from "../../components/search";
import { HorizontalScrollRow, SectionTitle } from "../../components/ui";
import { CATEGORIES } from "../../mocks/categories.mock";
import {
  RECENT_SEARCHES,
  SEARCH_PROMO_BANNER,
  TOP_SEARCH_CATEGORY_TILES,
} from "../../mocks/search.mock";
import type { SearchStackParamList } from "../../types/navigation.types";
import { colors } from "../../theme";

import {
  getKeywordSuggestions,
  getPreviouslyBoughtProducts,
  getProductImageUrl,
  getProductPackLabel,
  getProductSuggestions,
} from "./search.utils";

type Props = NativeStackScreenProps<SearchStackParamList, "SearchHome">;

export function SearchHomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const keywordSuggestions = useMemo(
    () => getKeywordSuggestions(trimmedQuery),
    [trimmedQuery],
  );

  const productSuggestions = useMemo(
    () => getProductSuggestions(trimmedQuery),
    [trimmedQuery],
  );

  const previouslyBought = useMemo(() => getPreviouslyBoughtProducts(), []);

  const topCategories = useMemo(() => {
    return TOP_SEARCH_CATEGORY_TILES.map((tile) => {
      const category = CATEGORIES.find((c) => c.id === tile.id);
      if (!category) {
        return null;
      }
      return { ...category, title: tile.title };
    }).filter((c): c is NonNullable<typeof c> => c != null);
  }, []);

  const goToResults = useCallback(
    (searchQuery: string, categoryId?: string) => {
      const q = searchQuery.trim();
      if (!q && !categoryId) {
        return;
      }
      navigation.navigate("SearchResults", {
        query: q || searchQuery,
        categoryId,
      });
    },
    [navigation],
  );

  const onSubmit = useCallback(() => {
    goToResults(trimmedQuery);
  }, [goToResults, trimmedQuery]);

  const onClear = useCallback(() => setQuery(""), []);

  const onBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const onRecentPress = useCallback(
    (term: string) => {
      setQuery(term);
      goToResults(term);
    },
    [goToResults],
  );

  const onCategoryPress = useCallback(
    (title: string, categoryId: string) => {
      goToResults(title, categoryId);
    },
    [goToResults],
  );

  const suggestionsContent = (
    <View className="flex-1">
      <Text className="px-4 pb-2 pt-1 text-[13px] text-pillfly-muted">
        Showing suggestions for{" "}
        <Text className="font-bold text-pillfly-ink">{trimmedQuery}</Text>
      </Text>

      {keywordSuggestions.map((term) => (
        <Pressable
          key={term}
          accessibilityRole="button"
          onPress={() => {
            setQuery(term);
            goToResults(term);
          }}
          className="flex-row items-center justify-between border-b border-pillfly-line/60 px-4 py-3.5 active:bg-pillfly-background"
        >
          <Text className="text-[15px] font-bold text-pillfly-ink">{term}</Text>
          <Feather name="search" size={18} color={colors.textSecondary} />
        </Pressable>
      ))}

      {productSuggestions.map((product) => {
        const imageUrl = getProductImageUrl(product);
        const packLabel = getProductPackLabel(product);

        return (
          <Pressable
            key={product.id}
            accessibilityRole="button"
            onPress={() => goToResults(product.title)}
            className="flex-row items-center gap-3 border-b border-pillfly-line/60 px-4 py-3 active:bg-pillfly-background"
          >
            <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-pillfly-line bg-pillfly-surface">
              <ProductImageWithPlaceholder uri={imageUrl ?? undefined} className="h-full w-full" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[14px] font-bold text-pillfly-ink" numberOfLines={2}>
                {product.title}
              </Text>
              {packLabel ? (
                <Text className="mt-0.5 text-[12px] text-pillfly-muted">{packLabel}</Text>
              ) : null}
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>
        );
      })}

      {keywordSuggestions.length === 0 && productSuggestions.length === 0 ? (
        <View className="items-center px-4 py-10">
          <Text className="text-[15px] font-semibold text-pillfly-ink">No suggestions found</Text>
          <Text className="mt-1 text-center text-[13px] text-pillfly-muted">
            Try another keyword or view all matching products.
          </Text>
        </View>
      ) : null}

      <View className="items-center px-4 py-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all results"
          onPress={onSubmit}
          className="min-w-[200px] rounded-full border-2 border-pillfly-primary px-8 py-3 active:opacity-90"
        >
          <Text className="text-center text-[15px] font-bold text-pillfly-primary">
            View all results
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const discoveryContent = (
    <ScrollView
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="px-4 pt-4">
        <SectionTitle title="Recent searches" variant="plain" />
        <HorizontalScrollRow contentClassName="gap-2 pb-1" gapClassName="gap-2">
          {RECENT_SEARCHES.map((term) => (
            <Pressable
              key={term}
              accessibilityRole="button"
              onPress={() => onRecentPress(term)}
              className="flex-row items-center gap-2 rounded-full border border-pillfly-line bg-pillfly-surface px-3 py-2 active:bg-pillfly-background"
            >
              <Feather name="clock" size={14} color={colors.textSecondary} />
              <Text className="max-w-[140px] text-[13px] font-medium text-pillfly-ink" numberOfLines={1}>
                {term}
              </Text>
            </Pressable>
          ))}
        </HorizontalScrollRow>
      </View>

      <View className="mt-6 px-4">
        <SectionTitle title="Top categories" variant="plain" />
        <HorizontalScrollRow contentClassName="pb-1" gapClassName="gap-3">
          {topCategories.map((category) => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              onPress={() => onCategoryPress(category.title, category.id)}
              className="active:opacity-90"
            >
              <ShopTile
                title={category.title}
                subtitle=""
                bg={category.tileBg}
                icon={category.image}
                width={108}
              />
            </Pressable>
          ))}
        </HorizontalScrollRow>
      </View>

      <View className="mt-6 px-4">
        <HomePromoBanner source={SEARCH_PROMO_BANNER} />
      </View>

      <View className="mt-6 px-4">
        <SectionTitle title="Previously bought items" variant="plain" />
        {previouslyBought.length === 0 ? (
          <Text className="text-[14px] text-pillfly-muted">No purchase history yet.</Text>
        ) : (
          previouslyBought.map((product) => (
            <ProductListRow
              key={product.id}
              title={product.title}
              imageUrl={getProductImageUrl(product)}
              onPress={() => goToResults(product.title)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-pillfly-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top }}
    >
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onBack={onBack}
        onClear={onClear}
        onSubmit={onSubmit}
      />

      {isSearching ? suggestionsContent : discoveryContent}
    </KeyboardAvoidingView>
  );
}
