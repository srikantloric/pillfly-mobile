import React, { memo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

export const LinkRow = memo(function LinkRow({ icon, title, subtitle, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center border-b border-pillfly-line/60 px-4 py-3.5 active:bg-pillfly-background"
    >
      <View className="mr-3 h-8 w-8 items-center justify-center">{icon}</View>
      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-semibold text-pillfly-primary">{title}</Text>
        {subtitle ? (
          <Text className="mt-0.5 text-[12px] text-pillfly-muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
});

LinkRow.displayName = "LinkRow";
