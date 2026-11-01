import React, { memo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton, ProductImageWithPlaceholder } from "@/components/ui";
import type { HealthcareProduct, ProductVariant } from "@/features/product/types/product";
import { formatInr } from "@/features/product/utils/productDisplay";
import {
  isVariantAvailable,
  variantMatchesOptionValue,
} from "@/features/product/utils/variantSelection";
import { colors } from "@/theme";

type Props = {
  visible: boolean;
  product: HealthcareProduct;
  selectedVariant?: ProductVariant;
  onClose: () => void;
  onSelect: (variant: ProductVariant) => void;
  onAdd: () => void;
};

export const VariantPickerSheet = memo(function VariantPickerSheet({
  visible,
  product,
  selectedVariant,
  onClose,
  onSelect,
  onAdd,
}: Props) {
  const insets = useSafeAreaInsets();
  const available = selectedVariant ? isVariantAvailable(selectedVariant) : false;
  const imageUrl = selectedVariant?.images[0]?.url;
  const showPrice =
    selectedVariant != null &&
    available &&
    !(selectedVariant.mrp === 0 && (selectedVariant.sellingPrice ?? 0) === 0);
  const salePrice = selectedVariant?.sellingPrice ?? selectedVariant?.mrp ?? 0;
  const discount = selectedVariant?.discount ?? 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable accessibilityRole="button" accessibilityLabel="Close variants" className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-2xl bg-pillfly-surface px-4 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-start gap-3">
            <View className="h-14 w-14 overflow-hidden rounded-lg border border-pillfly-line bg-pillfly-background">
              <ProductImageWithPlaceholder uri={imageUrl} className="h-full w-full" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[14px] font-bold leading-5 text-pillfly-ink" numberOfLines={2}>
                {product.title}
              </Text>
              {showPrice && selectedVariant ? (
                <View className="mt-1">
                  <Text className="text-[11px] text-pillfly-muted">
                    MRP <Text className="line-through">{formatInr(selectedVariant.mrp)}</Text>
                  </Text>
                  <View className="mt-0.5 flex-row items-baseline gap-1">
                    <Text className="text-[16px] font-bold text-pillfly-ink">{formatInr(salePrice)}</Text>
                    {discount > 0 ? (
                      <Text className="text-[12px] font-bold text-pillfly-promo-red">{discount}% OFF</Text>
                    ) : null}
                  </View>
                </View>
              ) : (
                <Text className="mt-1 text-[13px] font-semibold text-pillfly-promo-red">Out of stock</Text>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              className="h-8 w-8 items-center justify-center"
            >
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {available ? (
            <View className="mt-3 items-end">
              <PrimaryButton label="Add" size="sm" accessibilityLabel={`Add ${product.title}`} onPress={onAdd} />
            </View>
          ) : null}

          <Text className="mb-3 mt-4 text-[15px] font-bold text-pillfly-ink">Select Available Variants</Text>

          {product.variantOptions.map((option) => (
            <View key={option.id} className="mb-3">
              <View className="mb-2 flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-pillfly-promo-red" />
                <Text className="text-[14px] font-semibold text-pillfly-ink">{option.name}</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {option.values.map((value) => {
                  const variant = product.variants.find((item) =>
                    variantMatchesOptionValue(item, value.id),
                  );
                  const selected = selectedVariant
                    ? variantMatchesOptionValue(selectedVariant, value.id)
                    : false;
                  const inStock = variant ? isVariantAvailable(variant) : false;

                  return (
                    <Pressable
                      key={value.id}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !inStock, selected }}
                      accessibilityLabel={inStock ? value.value : `${value.value}, out of stock`}
                      disabled={!inStock}
                      onPress={() => {
                        if (variant && inStock) {
                          onSelect(variant);
                        }
                      }}
                      className={`min-w-[72px] rounded-lg border px-3 py-2 ${
                        selected
                          ? "border-pillfly-primary bg-pillfly-background"
                          : "border-pillfly-line bg-pillfly-surface"
                      } ${inStock ? "" : "opacity-50"}`}
                    >
                      <Text
                        className={`text-center text-[13px] font-semibold ${
                          selected ? "text-pillfly-primary" : "text-pillfly-ink"
                        }`}
                      >
                        {value.value}
                      </Text>
                      {!inStock ? (
                        <Text className="mt-0.5 text-center text-[10px] text-pillfly-promo-red">
                          Out of stock
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
});

VariantPickerSheet.displayName = "VariantPickerSheet";
