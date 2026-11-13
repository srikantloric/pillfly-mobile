import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

import type { CustomerAddress } from "../types/address.types";
import { addressLabelText, addressSummaryLine } from "../utils/addressSelection";

type Props = {
  address: CustomerAddress;
  onPressChange: () => void;
};

export function SelectedAddressBar({ address, onPressChange }: Props) {
  return (
    <View className="flex-row items-center gap-3 border-t border-pillfly-line bg-pillfly-surface px-4 py-3">
      <Feather name="map-pin" size={18} color={colors.primary} />
      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-bold text-pillfly-ink" numberOfLines={1}>
          Deliver to {addressLabelText(address.label)} ({address.postalCode})
        </Text>
        <Text className="mt-0.5 text-[12px] text-pillfly-muted" numberOfLines={1}>
          {addressSummaryLine(address)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change delivery address"
        onPress={onPressChange}
        hitSlop={8}
      >
        <Text className="text-[13px] font-bold uppercase text-pillfly-ink">Change</Text>
      </Pressable>
    </View>
  );
}
