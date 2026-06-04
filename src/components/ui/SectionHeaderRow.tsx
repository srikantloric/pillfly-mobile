import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  className?: string;
};

export const SectionHeaderRow = memo(function SectionHeaderRow({
  title,
  actionLabel,
  onPressAction,
  className = "mb-3",
}: Props) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <Text className="flex-1 text-[13px] font-bold uppercase tracking-wide text-pillfly-ink">
        {title}
      </Text>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onPressAction}
          className="active:opacity-80"
        >
          <Text className="text-[13px] font-semibold text-pillfly-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

SectionHeaderRow.displayName = "SectionHeaderRow";
