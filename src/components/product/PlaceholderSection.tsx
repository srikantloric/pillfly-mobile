import React, { memo } from "react";
import { Text, View } from "react-native";

type Props = {
  title: string;
};

/**
 * Temporary scaffold marker for Product Detail sections.
 * Replace with real section components during UI implementation.
 */
export const PlaceholderSection = memo(function PlaceholderSection({ title }: Props) {
  return (
    <View className="mx-4 mb-3 rounded-xl border border-dashed border-pillfly-line bg-pillfly-surface px-4 py-5">
      <Text className="text-center text-[14px] font-semibold text-pillfly-ink">{title}</Text>
    </View>
  );
});

PlaceholderSection.displayName = "PlaceholderSection";
