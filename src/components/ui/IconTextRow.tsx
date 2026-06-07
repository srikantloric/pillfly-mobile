import React, { memo, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

type Props = {
  icon: ReactNode;
  children: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  trailing?: ReactNode;
  rowClassName?: string;
  iconWrapperClassName?: string;
  pressableClassName?: string;
};

const DEFAULT_ROW_CLASS = "flex-row items-center gap-2 px-4 py-3";
const DEFAULT_ICON_WRAPPER_CLASS = "h-6 w-6 items-center justify-center";

export const IconTextRow = memo(function IconTextRow({
  icon,
  children,
  onPress,
  showChevron = false,
  trailing,
  rowClassName = DEFAULT_ROW_CLASS,
  iconWrapperClassName = DEFAULT_ICON_WRAPPER_CLASS,
  pressableClassName = "active:opacity-90",
}: Props) {
  const content = (
    <View className={rowClassName}>
      <View className={iconWrapperClassName}>{icon}</View>
      <View className="min-w-0 flex-1">{children}</View>
      {trailing}
      {showChevron ? (
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className={pressableClassName}>
        {content}
      </Pressable>
    );
  }

  return content;
});

IconTextRow.displayName = "IconTextRow";
