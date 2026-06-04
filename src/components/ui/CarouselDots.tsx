import React, { memo } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

export type CarouselDotsVariant = "primary" | "ink";

const VARIANT_STYLES: Record<
  CarouselDotsVariant,
  { activeClassName: string; activeWidth: number; inactiveWidth: number }
> = {
  primary: {
    activeClassName: "bg-pillfly-primary",
    activeWidth: 18,
    inactiveWidth: 6,
  },
  ink: {
    activeClassName: "bg-pillfly-ink",
    activeWidth: 8,
    inactiveWidth: 6,
  },
};

type Props = {
  count: number;
  activeIndex: number;
  variant?: CarouselDotsVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export const CarouselDots = memo(function CarouselDots({
  count,
  activeIndex,
  variant = "primary",
  className = "",
  style,
}: Props) {
  if (count <= 1) {
    return null;
  }

  const config = VARIANT_STYLES[variant];

  return (
    <View className={`flex-row items-center justify-center gap-1.5 ${className}`} style={style}>
      {Array.from({ length: count }, (_, index) => {
        const active = index === activeIndex;
        return (
          <View
            key={index}
            className={`rounded-full ${active ? config.activeClassName : "bg-pillfly-line"}`}
            style={{
              width: active ? config.activeWidth : config.inactiveWidth,
              height: 6,
            }}
          />
        );
      })}
    </View>
  );
});

CarouselDots.displayName = "CarouselDots";
