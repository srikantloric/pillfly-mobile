import React, { memo, useMemo } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

const DEFAULT_MAX_QUANTITY = 10;

type Props = {
  visible: boolean;
  quantity: number;
  maxQuantity?: number;
  productTitle?: string;
  onClose: () => void;
  onSelect: (quantity: number) => void;
  onRemove: () => void;
};

function buildQuantityOptions(current: number, maxQuantity: number): number[] {
  const upper = Math.max(maxQuantity, Math.max(1, Math.floor(current)));
  return Array.from({ length: upper }, (_, index) => index + 1);
}

export const QuantitySelectorSheet = memo(function QuantitySelectorSheet({
  visible,
  quantity,
  maxQuantity = DEFAULT_MAX_QUANTITY,
  productTitle,
  onClose,
  onSelect,
  onRemove,
}: Props) {
  const insets = useSafeAreaInsets();
  const options = useMemo(
    () => buildQuantityOptions(quantity, maxQuantity),
    [maxQuantity, quantity],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close quantity selector"
        onPress={onClose}
        className="flex-1 justify-center bg-black/40 px-6"
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="max-h-[70%] overflow-hidden rounded-2xl border border-pillfly-line bg-pillfly-surface"
          style={{ marginBottom: Math.max(insets.bottom, 0) }}
        >
          <View className="flex-row items-center justify-between border-b border-pillfly-line px-4 py-3.5">
            <Text className="text-[17px] font-bold text-pillfly-ink">Select Quantity</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              className="h-8 w-8 items-center justify-center"
            >
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            className="max-h-80"
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((value) => {
              const selected = value === quantity;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Quantity ${value}${productTitle ? ` for ${productTitle}` : ""}`}
                  onPress={() => onSelect(value)}
                  className="flex-row items-center justify-between border-b border-pillfly-line px-4 py-3.5 active:bg-pillfly-background"
                >
                  <Text className="text-[16px] font-semibold text-pillfly-ink">{value}</Text>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selected ? "border-pillfly-primary" : "border-pillfly-muted"
                    }`}
                  >
                    {selected ? <View className="h-2.5 w-2.5 rounded-full bg-pillfly-primary" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              productTitle ? `Remove ${productTitle} from cart` : "Remove item from cart"
            }
            onPress={onRemove}
            className="flex-row items-center justify-center gap-2 px-4 py-4 active:opacity-80"
          >
            <Feather name="trash-2" size={18} color={colors.promoRed} />
            <Text className="text-[15px] font-semibold text-pillfly-promo-red">Remove Item</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

QuantitySelectorSheet.displayName = "QuantitySelectorSheet";
