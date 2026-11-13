import React, { memo, useCallback } from "react";
import { Text, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/ui";
import type { Product, ProductVariant } from "@/features/product/types/product";
import {
  formatInr,
  getProductManufacturerLabel,
  getProductPackLabelDisplay,
  getProductPricing,
  getProductUnitPriceDetail,
  isProductInStock,
} from "@/features/product/utils/productDisplay";
import { isVariantAvailable } from "@/features/product/utils/variantSelection";

import {
  PDP_HORIZONTAL_PADDING,
  PDP_SHEET_RADIUS,
  PDP_SHEET_SHADOW,
  PDP_SUBTITLE_CLASS,
  PDP_SURFACE_RADIUS,
} from "../constants/productDetail.constants";

type Props = {
  product: Product;
  variant?: ProductVariant;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

export const ProductInformationCard = memo(function ProductInformationCard({
  product,
  variant,
  onAddToCart,
  onNotify,
}: Props) {
  const inStock = variant ? isVariantAvailable(variant) : isProductInStock(product);
  const pricing = variant
    ? inStock
      ? {
          mrp: variant.mrp,
          salePrice: variant.sellingPrice ?? variant.mrp,
          discountPercent: variant.discount ?? 0,
        }
      : null
    : getProductPricing(product);
  const manufacturer = getProductManufacturerLabel(product);
  const packLabel = getProductPackLabelDisplay(product);
  const unitPriceDetail = getProductUnitPriceDetail(product);

  const handlePrimaryAction = useCallback(() => {
    if (inStock) {
      onAddToCart?.(product);
      return;
    }
    onNotify?.(product);
  }, [inStock, onAddToCart, onNotify, product]);

  return (
    <View
      className={`-mt-1 ${PDP_SHEET_RADIUS} bg-pillfly-surface ${PDP_HORIZONTAL_PADDING} pb-4 pt-4`}
      style={PDP_SHEET_SHADOW}
    >
      <Text className="text-[17px] font-bold leading-[22px] text-pillfly-ink">{product.title}</Text>

      {manufacturer ? (
        <Text className={`mt-1 ${PDP_SUBTITLE_CLASS}`}>By {manufacturer}</Text>
      ) : null}

      {packLabel ? (
        <Text className={`mt-0.5 ${PDP_SUBTITLE_CLASS}`}>{packLabel}</Text>
      ) : null}

      {pricing ? (
        <View
          className={`mt-4 flex-row gap-3 border border-pillfly-line ${PDP_SURFACE_RADIUS} p-3`}
        >
          <View className="min-w-0 flex-1 justify-end">
            <Text className="text-[12px] text-pillfly-muted">
              MRP <Text className="line-through">{formatInr(pricing.mrp)}</Text>
            </Text>

            <View className="mt-1 flex-row flex-wrap items-baseline gap-1.5">
              <Text className="text-[22px] font-bold text-pillfly-ink">
                {formatInr(pricing.salePrice)}*
              </Text>
              {pricing.discountPercent > 0 ? (
                <Text className="text-[14px] font-bold text-pillfly-promo-red">
                  {pricing.discountPercent}% OFF
                </Text>
              ) : null}
            </View>

            {unitPriceDetail ? (
              <Text className={`mt-1 text-[11px] leading-[15px] text-pillfly-muted`}>
                {unitPriceDetail}
              </Text>
            ) : null}
          </View>

          <View className="justify-end">
            {inStock ? (
              <PrimaryButton
                label="Add to Cart"
                size="sm"
                accessibilityLabel={`Add ${product.title} to cart`}
                onPress={handlePrimaryAction}
                className="min-w-[108px] rounded-xl px-4"
              />
            ) : (
              <OutlineButton
                label="Notify"
                size="sm"
                accessibilityLabel={`Notify when ${product.title} is available`}
                onPress={handlePrimaryAction}
                className="min-w-[108px] rounded-xl px-4"
              />
            )}
          </View>
        </View>
      ) : variant && !inStock ? (
        <View className={`mt-4 border border-pillfly-line ${PDP_SURFACE_RADIUS} p-3`}>
          <Text className="text-[15px] font-bold text-pillfly-promo-red">Out of stock</Text>
          <View className="mt-3">
            <OutlineButton
              label="Notify"
              size="sm"
              accessibilityLabel={`Notify when ${product.title} is available`}
              onPress={handlePrimaryAction}
              className="min-w-[108px] rounded-xl px-4"
            />
          </View>
        </View>
      ) : null}
    </View>
  );
});

ProductInformationCard.displayName = "ProductInformationCard";
