import React, { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import type { Product } from "@/types/product";
import {
  formatInr,
  getProductImageUrl,
  getProductPackLabel,
  getProductPricing,
  getProductRating,
  isMedicineProduct,
  isProductInStock,
} from "@/utils/productDisplay";
import { ProductImageWithPlaceholder } from "./ProductImageWithPlaceholder";

const TITLE_LINE_HEIGHT = 18;
const TITLE_MAX_LINES = 2;
const TITLE_BLOCK_HEIGHT = TITLE_LINE_HEIGHT * TITLE_MAX_LINES;
const PACK_LINE_HEIGHT = 16;
const PRICE_BLOCK_HEIGHT = 44;

type Props = {
  product: Product;
  width: number;
  onPress?: () => void;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

export const SearchResultProductCard = memo(function SearchResultProductCard({
  product,
  width,
  onPress,
  onAddToCart,
  onNotify,
}: Props) {
  const inStock = isProductInStock(product);
  const pricing = getProductPricing(product);
  const packLabel = getProductPackLabel(product);
  const rating = getProductRating(product);
  const imageUrl = getProductImageUrl(product);
  const isRx = isMedicineProduct(product) && product.isPrescriptionRequired;

  const handlePrimaryAction = useCallback(() => {
    if (inStock) {
      onAddToCart?.(product);
      return;
    }
    onNotify?.(product);
  }, [inStock, onAddToCart, onNotify, product]);

  return (
    <View
      style={{ width, flex: 1 }}
      className="flex-col overflow-hidden border border-pillfly-line bg-pillfly-surface"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={product.title}
        onPress={onPress}
        className="flex-1 active:opacity-95"
      >
        <View className="relative h-[130px] bg-pillfly-background px-2 pt-2">
          {rating != null ? (
            <View className="absolute left-2 top-2 z-20 flex-row items-center gap-0.5 rounded bg-pillfly-surface px-1.5 py-0.5 shadow-sm">
              <Feather name="star" size={10} color="#EAB308" />
              <Text className="text-[10px] font-bold text-pillfly-ink">{rating.toFixed(1)}</Text>
            </View>
          ) : null}

          {isRx ? (
            <View className="absolute right-2 top-2 z-20 rounded border border-pillfly-line bg-pillfly-surface px-1 py-0.5">
              <Text className="text-[9px] font-bold text-pillfly-muted">Rx</Text>
            </View>
          ) : null}

          <ProductImageWithPlaceholder
            uri={imageUrl}
            dimmed={!inStock}
            className="h-full w-full"
          />

          {!inStock ? (
            <View className="absolute inset-0 z-10 items-center justify-center bg-white/75">
              <Text className="text-[15px] font-bold text-red-600">Out of Stock</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-1 px-2.5 pb-2 pt-2">
          <Text
            className="text-[13px] font-bold text-pillfly-ink"
            numberOfLines={TITLE_MAX_LINES}
            ellipsizeMode="tail"
            style={{
              lineHeight: TITLE_LINE_HEIGHT,
              height: TITLE_BLOCK_HEIGHT,
            }}
          >
            {product.title}
          </Text>

          <Text
            className="text-[11px] text-pillfly-muted"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ lineHeight: PACK_LINE_HEIGHT, height: PACK_LINE_HEIGHT }}
          >
            {packLabel ?? " "}
          </Text>

          <View style={{ minHeight: PRICE_BLOCK_HEIGHT, justifyContent: "flex-end" }}>
            {pricing ? (
              <View className="mt-1">
                <Text className="text-[10px] text-pillfly-muted">
                  MRP{" "}
                  <Text className="line-through">{formatInr(pricing.mrp)}</Text>
                </Text>
                <View className="mt-0.5 flex-row flex-wrap items-baseline gap-1">
                  <Text className="text-[15px] font-bold text-pillfly-ink">
                    {formatInr(pricing.salePrice)}
                  </Text>
                  {pricing.discountPercent > 0 ? (
                    <Text className="text-[11px] font-semibold text-pillfly-promo">
                      {pricing.discountPercent}% OFF
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      <View className="px-2.5 pb-2.5 pt-1">
        {inStock ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.title} to cart`}
            onPress={handlePrimaryAction}
            className="items-center rounded-lg bg-pillfly-primary py-2.5 active:opacity-90"
          >
            <Text className="text-[13px] font-bold text-white">Add to cart</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notify when ${product.title} is available`}
            onPress={handlePrimaryAction}
            className="items-center rounded-lg border border-pillfly-primary bg-pillfly-surface py-2.5 active:opacity-90"
          >
            <Text className="text-[13px] font-bold text-pillfly-primary">Notify</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

SearchResultProductCard.displayName = "SearchResultProductCard";
