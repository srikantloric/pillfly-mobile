import React, { memo } from "react";
import { Text, View } from "react-native";

type Props = {
  items: string[];
  className?: string;
  itemClassName?: string;
};

export const BulletList = memo(function BulletList({
  items,
  className = "",
  itemClassName = "text-[13px] leading-[20px] text-pillfly-muted",
}: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View className={className}>
      {items.map((item, index) => (
        <View key={`${index}-${item.slice(0, 24)}`} className="mb-2 flex-row gap-2">
          <Text className="mt-0.5 text-[13px] text-pillfly-muted">•</Text>
          <Text className={`min-w-0 flex-1 ${itemClassName}`}>{item}</Text>
        </View>
      ))}
    </View>
  );
});

BulletList.displayName = "BulletList";
