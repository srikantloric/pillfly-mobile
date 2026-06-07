import React, { memo } from "react";
import { Pressable, Text, type PressableProps } from "react-native";

type Props = PressableProps & {
  label: string;
  size?: "md" | "sm";
};

export const OutlineButton = memo(function OutlineButton({
  label,
  size = "md",
  className,
  ...pressableProps
}: Props) {
  const sizeClass = size === "sm" ? "min-h-[36px] px-3 py-2" : "min-h-[44px] px-5 py-3";
  const textClass = size === "sm" ? "text-[13px]" : "text-[15px]";

  return (
    <Pressable
      accessibilityRole="button"
      className={`items-center justify-center rounded-xl border border-pillfly-primary bg-pillfly-surface active:opacity-90 ${sizeClass} ${className ?? ""}`}
      {...pressableProps}
    >
      <Text className={`font-bold text-pillfly-primary ${textClass}`}>{label}</Text>
    </Pressable>
  );
});

OutlineButton.displayName = "OutlineButton";
