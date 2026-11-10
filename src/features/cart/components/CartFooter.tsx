import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCartTotal } from "../utils/cartPricing";

type Props = {
  totalAmount: number;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPressViewBill: () => void;
  onPressPrimary: () => void;
};


export function CartFooter({
  totalAmount,
  primaryLabel,
  primaryDisabled = false,
  onPressViewBill,
  onPressPrimary,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between border-t border-pillfly-line bg-pillfly-surface px-4 py-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View>
        <Text className="text-[20px] font-bold text-pillfly-ink">{formatCartTotal(totalAmount)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View bill"
          onPress={onPressViewBill}
          hitSlop={8}
        >
          <Text className="mt-0.5 text-[13px] font-semibold text-pillfly-ink underline">
            View Bill
          </Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        disabled={primaryDisabled}
        onPress={onPressPrimary}
        className={`min-w-[160px] max-w-[210px] flex-row items-center justify-center gap-2 rounded-xl bg-pillfly-primary px-4 py-3.5 ${
          primaryDisabled ? "opacity-60" : "active:opacity-90"
        }`}
      >
        <Text className="shrink text-center text-[14px] font-bold text-white" numberOfLines={2}>
          {primaryLabel}
        </Text>
        <View className="h-7 w-7 items-center justify-center rounded-full bg-white">
          <Feather name="arrow-right" size={16} color="#0D9488" />
        </View>
      </Pressable>
    </View>
  );
}
