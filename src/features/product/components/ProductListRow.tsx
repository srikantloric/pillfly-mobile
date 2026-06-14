import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { ProductImageWithPlaceholder } from "@/features/search/components";
import { colors } from "@/theme";

type Props = {
  title: string;
  imageUrl?: string | null;
  onPress?: () => void;
};

export const ProductListRow = memo(function ProductListRow({ title, imageUrl, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="mb-3 flex-row items-center gap-3 rounded-xl border border-pillfly-line bg-pillfly-surface p-3 active:bg-pillfly-background"
    >
      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-pillfly-line bg-white">
        <ProductImageWithPlaceholder uri={imageUrl ?? undefined} className="h-full w-full" />
      </View>
      <Text className="flex-1 text-[14px] font-semibold text-pillfly-ink" numberOfLines={2}>
        {title}
      </Text>
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
});

ProductListRow.displayName = "ProductListRow";
