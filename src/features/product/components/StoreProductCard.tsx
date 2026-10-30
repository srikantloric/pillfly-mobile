import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { ProductImageWithPlaceholder } from "@/components/ui";
import type { Product } from "@/features/product/types/product";
import {
  formatInr,
  getProductImageUrl,
  getProductPricing,
  isMedicineProduct,
} from "@/features/product/utils/productDisplay";

const TITLE_LINE_HEIGHT = 18;
const TITLE_MAX_LINES = 2;
const TITLE_BLOCK_HEIGHT = TITLE_LINE_HEIGHT * TITLE_MAX_LINES;

type Props = {
  product: Product;
  width: number;
  onPress?: () => void;
};

export const StoreProductCard = memo(function StoreProductCard({ product, width, onPress }: Props) {
  const pricing = getProductPricing(product);
  const imageUrl = getProductImageUrl(product);
  const isRx = isMedicineProduct(product) && product.isPrescriptionRequired;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.title}
      onPress={onPress}
      style={{ width }}
      className="overflow-hidden rounded-2xl border border-pillfly-line bg-pillfly-surface active:opacity-95"
    >
      <View className="relative h-[130px] bg-pillfly-background px-2 pt-2">
        {isRx ? (
          <View className="absolute right-2 top-2 z-20 rounded border border-pillfly-line bg-pillfly-surface px-1 py-0.5">
            <Text className="text-[9px] font-bold text-pillfly-muted">Rx</Text>
          </View>
        ) : null}
        <ProductImageWithPlaceholder uri={imageUrl} className="h-full w-full" />
      </View>

      <View className="px-2.5 pb-3 pt-2">
        <Text
          className="text-[13px] font-bold text-pillfly-ink"
          numberOfLines={TITLE_MAX_LINES}
          ellipsizeMode="tail"
          style={{ lineHeight: TITLE_LINE_HEIGHT, height: TITLE_BLOCK_HEIGHT }}
        >
          {product.title}
        </Text>

        {pricing ? (
          <View className="mt-1">
            <Text className="text-[10px] text-pillfly-muted">
              MRP <Text className="line-through">{formatInr(pricing.mrp)}</Text>
            </Text>
            <View className="mt-0.5 flex-row flex-wrap items-baseline gap-1">
              <Text className="text-[15px] font-bold text-pillfly-ink">{formatInr(pricing.salePrice)}</Text>
              {pricing.discountPercent > 0 ? (
                <Text className="text-[11px] font-semibold text-pillfly-promo">
                  {pricing.discountPercent}% OFF
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

StoreProductCard.displayName = "StoreProductCard";
