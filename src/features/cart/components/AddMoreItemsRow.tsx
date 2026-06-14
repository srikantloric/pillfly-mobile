import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

type Props = {
  onPress: () => void;
};

export function AddMoreItemsRow({ onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add more items to your cart"
      onPress={onPress}
      className="mx-4 mt-4 flex-row items-center justify-between rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-4 active:bg-pillfly-background"
    >
      <Text className="text-[14px] font-semibold text-pillfly-section">
        Add more items to your cart
      </Text>
      <View className="h-8 w-8 items-center justify-center rounded-full border border-pillfly-primary">
        <Feather name="plus" size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
}
