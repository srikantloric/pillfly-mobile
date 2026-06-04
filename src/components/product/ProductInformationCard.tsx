import React, { memo, useCallback } from "react";
import { Text, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/ui";
import type { Product } from "@/types/product";
import {
  formatInr,
  getProductManufacturerLabel,
  getProductPackLabelDisplay,
  getProductPricing,
  getProductUnitPriceDetail,
  isProductInStock,
} from "@/utils/productDisplay";

type Props = {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

export const ProductInformationCard = memo(function ProductInformationCard({
  product,
  onAddToCart,
  onNotify,
}: Props) {
  const inStock = isProductInStock(product);
  const pricing = getProductPricing(product);
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
      className="-mt-1 rounded-t-2xl bg-pillfly-surface px-4 pb-4 pt-4"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text className="text-[17px] font-bold leading-[22px] text-pillfly-ink">{product.title}</Text>

      {manufacturer ? (
        <Text className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-pillfly-muted">
          By {manufacturer}
        </Text>
      ) : null}

      {packLabel ? (
        <Text className="mt-0.5 text-[12px] font-semibold uppercase tracking-wide text-pillfly-muted">
          {packLabel}
        </Text>
      ) : null}

      {pricing ? (
        <View className="mt-4 flex-row items-stretch gap-3 rounded-xl border border-pillfly-line p-3">
          <View className="min-w-0 flex-1 justify-center">
            <Text className="text-[12px] text-pillfly-muted">
              MRP{" "}
              <Text className="line-through">{formatInr(pricing.mrp)}</Text>
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
              <Text className="mt-1 text-[11px] leading-[15px] text-pillfly-muted">
                {unitPriceDetail}
              </Text>
            ) : null}
          </View>

          <View className="justify-center">
            {inStock ? (
              <PrimaryButton
                label="Add to Cart"
                size="sm"
                accessibilityLabel={`Add ${product.title} to cart`}
                onPress={handlePrimaryAction}
                className="min-w-[108px] rounded-lg px-4"
              />
            ) : (
              <OutlineButton
                label="Notify"
                size="sm"
                accessibilityLabel={`Notify when ${product.title} is available`}
                onPress={handlePrimaryAction}
                className="min-w-[108px] rounded-lg px-4"
              />
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
});

ProductInformationCard.displayName = "ProductInformationCard";
