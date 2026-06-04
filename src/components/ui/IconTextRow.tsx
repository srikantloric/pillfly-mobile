import React, { memo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

type Props = {
  icon: ReactNode;
  children: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

export const IconTextRow = memo(function IconTextRow({
  icon,
  children,
  onPress,
  showChevron = false,
}: Props) {
  const content = (
    <View className="flex-row items-center gap-2 px-4 py-3">
      <View className="h-6 w-6 items-center justify-center">{icon}</View>
      <View className="min-w-0 flex-1">{children}</View>
      {showChevron ? (
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-90">
        {content}
      </Pressable>
    );
  }

  return content;
});

IconTextRow.displayName = "IconTextRow";
