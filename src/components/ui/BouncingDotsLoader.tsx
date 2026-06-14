import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

import { colors } from "@/theme";

const DOT_SIZE = 10;
const BOUNCE_HEIGHT = 15;
/** One dot: up + down as a fraction of the master loop (0→1). */
const BOUNCE_HALF = 0.15;
/** Offset between dot starts — half an up-stroke so the next dot is mid-bounce at the previous peak. */
const STAGGER = BOUNCE_HALF / 2;
const CYCLE_MS = 1300;

type DotProps = {
  progress: Animated.Value;
  index: number;
  color: string;
};

function BouncingDot({ progress, index, color }: DotProps) {
  const start = index * STAGGER;
  const peak = start + BOUNCE_HALF;
  const end = start + BOUNCE_HALF * 2;

  const translateY = progress.interpolate({
    inputRange: [0, start, peak, end, 1],
    outputRange: [0, 0, -BOUNCE_HEIGHT, 0, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: color,
        transform: [{ translateY }],
      }}
    />
  );
}

type Props = {
  tagline?: string;
  dotColor?: string;
};

export function BouncingDotsLoader({
  tagline = "1,00,000+ medicine & healthcare products",
  dotColor = colors.primary,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);

    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [progress]);

  return (
    <View className="flex-1 items-center justify-center bg-pillfly-surface px-8">
      <View className="flex-row items-center gap-2.5">
        <BouncingDot progress={progress} index={0} color={dotColor} />
        <BouncingDot progress={progress} index={1} color={dotColor} />
        <BouncingDot progress={progress} index={2} color={dotColor} />
      </View>
      <Text className="mt-5 text-center text-[14px] leading-5 text-pillfly-muted">{tagline}</Text>
    </View>
  );
}
