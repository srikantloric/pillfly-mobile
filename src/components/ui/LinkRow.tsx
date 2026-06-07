import React, { memo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  containerClassName?: string;
  borderClassName?: string;
  iconWrapperClassName?: string;
  showChevron?: boolean;
};

const DEFAULT_TITLE_CLASS = "text-[14px] font-semibold text-pillfly-primary";
const DEFAULT_SUBTITLE_CLASS = "mt-0.5 text-[12px] text-pillfly-muted";
const DEFAULT_BORDER_CLASS = "border-b border-pillfly-line/60";
const DEFAULT_CONTAINER_CLASS =
  "flex-row items-center px-4 py-3.5 active:bg-pillfly-background";
const DEFAULT_ICON_WRAPPER_CLASS = "mr-3 h-8 w-8 items-center justify-center";

export const LinkRow = memo(function LinkRow({
  icon,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  titleClassName = DEFAULT_TITLE_CLASS,
  subtitleClassName = DEFAULT_SUBTITLE_CLASS,
  containerClassName = DEFAULT_CONTAINER_CLASS,
  borderClassName = DEFAULT_BORDER_CLASS,
  iconWrapperClassName = DEFAULT_ICON_WRAPPER_CLASS,
  showChevron = true,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      className={`${containerClassName} ${borderClassName}`.trim()}
    >
      <View accessible={false} importantForAccessibility="no-hide-descendants" className={iconWrapperClassName}>
        {icon}
      </View>
      <View className="min-w-0 flex-1 pr-2">
        <Text className={titleClassName}>{title}</Text>
        {subtitle ? (
          <Text className={subtitleClassName} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {showChevron ? (
        <Feather
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          name="chevron-right"
          size={20}
          color={colors.textSecondary}
        />
      ) : null}
    </Pressable>
  );
});

LinkRow.displayName = "LinkRow";
