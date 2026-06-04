import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlaceholderSection } from "@/components/product";
import { useProductDetail } from "@/hooks/useProductDetail";
import type { AppStackParamList } from "@/types/navigation.types";
import { colors, spacing } from "@/theme";

import { PRODUCT_DETAIL_SCROLL_SECTIONS } from "./productDetail.sections";

type Props = NativeStackScreenProps<AppStackParamList, "ProductDetail">;

/** Reserved space for fixed header / footer placeholders (scaffold only). */
const STICKY_HEADER_HEIGHT = 72;
const STICKY_FOOTER_HEIGHT = 64;

export function ProductDetailScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { product, loading, error } = useProductDetail(route.params.productId);

  const scrollPaddingTop = insets.top + STICKY_HEADER_HEIGHT;
  const scrollPaddingBottom = insets.bottom + STICKY_FOOTER_HEIGHT + spacing.md;

  return (
    <View className="flex-1 bg-pillfly-background">
      <View
        className="absolute left-0 right-0 top-0 z-20 border-b border-dashed border-pillfly-line bg-pillfly-surface/95"
        style={{ paddingTop: insets.top }}
      >
        <View className="min-h-[56px] items-center justify-center px-4 py-3">
          <Text className="text-[14px] font-semibold text-pillfly-ink">Header</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: scrollPaddingTop,
          paddingBottom: scrollPaddingBottom,
        }}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-3 text-[14px] text-pillfly-muted">Loading product…</Text>
          </View>
        ) : null}

        {error ? (
          <View className="mx-4 mb-3 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-5">
            <Text className="text-center text-[14px] text-pillfly-promo">{error.message}</Text>
          </View>
        ) : null}

        {product ? (
          <View className="mx-4 mb-4 rounded-lg bg-pillfly-surface px-3 py-2">
            <Text className="text-[11px] text-pillfly-muted">Scaffold — productId</Text>
            <Text className="text-[13px] font-medium text-pillfly-ink" numberOfLines={1}>
              {product.id} · {product.title}
            </Text>
          </View>
        ) : null}

        {PRODUCT_DETAIL_SCROLL_SECTIONS.map((sectionTitle) => (
          <PlaceholderSection key={sectionTitle} title={sectionTitle} />
        ))}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-dashed border-pillfly-line bg-pillfly-surface/95"
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="min-h-[56px] items-center justify-center px-4 py-3">
          <Text className="text-[14px] font-semibold text-pillfly-ink">
            Sticky Bottom Cart Bar
          </Text>
        </View>
      </View>
    </View>
  );
}
