import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { HEADER_HIT_SLOP } from "@/components/header/appHeader.constants";
import { colors } from "@/theme";

type Props = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  showActionChevron?: boolean;
  className?: string;
};

export const SectionHeaderRow = memo(function SectionHeaderRow({
  title,
  actionLabel,
  onPressAction,
  showActionChevron = false,
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
          hitSlop={HEADER_HIT_SLOP}
          onPress={onPressAction}
          className="min-h-[44px] flex-row items-center gap-0.5 active:opacity-80"
        >
          <Text className="text-[13px] font-semibold text-pillfly-primary">{actionLabel}</Text>
          {showActionChevron ? (
            <Feather
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              name="chevron-right"
              size={14}
              color={colors.primary}
            />
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
});

SectionHeaderRow.displayName = "SectionHeaderRow";
