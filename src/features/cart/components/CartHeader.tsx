import React from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HEADER_HIT_SLOP } from "@/components/header/appHeader.constants";
import { colors } from "@/theme";

type Props = {
  onPressBack: () => void;
  onPressSearch: () => void;
  onPressSaveForLater?: () => void;
};

export function CartHeader({ onPressBack, onPressSearch, onPressSaveForLater }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between border-b border-pillfly-line bg-pillfly-surface px-2"
      style={{ paddingTop: insets.top + 4, paddingBottom: 12 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={HEADER_HIT_SLOP}
        onPress={onPressBack}
        className="h-11 w-11 items-center justify-center"
      >
        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
      </Pressable>

      <View className="flex-row items-center gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Saved for later"
          hitSlop={HEADER_HIT_SLOP}
          onPress={onPressSaveForLater}
          className="h-11 w-11 items-center justify-center"
        >
          <Feather name="heart" size={22} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search"
          hitSlop={HEADER_HIT_SLOP}
          onPress={onPressSearch}
          className="h-11 w-11 items-center justify-center"
        >
          <Feather name="search" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
