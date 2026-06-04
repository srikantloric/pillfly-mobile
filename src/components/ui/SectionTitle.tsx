import React, { memo } from "react";
import { Text, View } from "react-native";

type Props = {
  title: string;
  /** Teal underline accent width (Home screen style). */
  underlineWidth?: number;
  /** Search-style bold title without underline. */
  variant?: "accent" | "plain";
  className?: string;
};

export const SectionTitle = memo(function SectionTitle({
  title,
  underlineWidth = 40,
  variant = "accent",
  className = "mb-3",
}: Props) {
  if (variant === "plain") {
    return (
      <Text className={`text-[15px] font-bold text-pillfly-ink ${className}`}>{title}</Text>
    );
  }

  return (
    <View className={`flex-row items-center ${className}`}>
      <Text className="text-[13px] font-bold tracking-wide text-pillfly-section">{title}</Text>
      <View
        className="ml-2 h-0.5 flex-1 rounded-full bg-pillfly-primary"
        style={{ maxWidth: underlineWidth }}
      />
    </View>
  );
});

SectionTitle.displayName = "SectionTitle";
