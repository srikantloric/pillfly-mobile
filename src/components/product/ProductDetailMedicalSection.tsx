import React, { memo, type ReactNode } from "react";
import { Text, View, type LayoutChangeEvent } from "react-native";

import { BulletList } from "@/components/ui";

type Props = {
  title: string;
  icon: ReactNode;
  bullets: string[];
  onLayout?: (event: LayoutChangeEvent) => void;
};

export const ProductDetailMedicalSection = memo(function ProductDetailMedicalSection({
  title,
  icon,
  bullets,
  onLayout,
}: Props) {
  return (
    <View
      onLayout={onLayout}
      className="border-b border-pillfly-line bg-pillfly-surface px-4 py-3.5"
    >
      <View className="mb-3 flex-row items-center gap-2.5">
        <View className="h-7 w-7 items-center justify-center">{icon}</View>
        <Text className="text-[14px] font-bold text-pillfly-ink">{title}</Text>
      </View>
      <BulletList items={bullets} />
    </View>
  );
});

ProductDetailMedicalSection.displayName = "ProductDetailMedicalSection";
