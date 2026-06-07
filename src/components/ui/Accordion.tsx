import React, { memo, useCallback, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

const ANIMATION_DURATION_MS = 220;

type Props = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  headerClassName?: string;
};

export const Accordion = memo(function Accordion({
  title,
  children,
  defaultExpanded = false,
  headerClassName = "bg-pillfly-surface",
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const expandedRef = useRef(defaultExpanded);

  const runHeightAnimation = useCallback(
    (toExpanded: boolean, height: number) => {
      Animated.timing(animatedHeight, {
        toValue: toExpanded ? height : 0,
        duration: ANIMATION_DURATION_MS,
        useNativeDriver: false,
      }).start();
    },
    [animatedHeight],
  );

  const handleMeasure = useCallback(
    (height: number) => {
      if (height <= 0) {
        return;
      }

      setContentHeight(height);
      setIsMeasured(true);

      if (expandedRef.current) {
        animatedHeight.setValue(height);
      }
    },
    [animatedHeight],
  );

  const toggle = useCallback(() => {
    if (!isMeasured || contentHeight <= 0) {
      return;
    }

    const next = !expandedRef.current;
    expandedRef.current = next;
    setExpanded(next);
    runHeightAnimation(next, contentHeight);
  }, [contentHeight, isMeasured, runHeightAnimation]);

  const expandHint = expanded ? "Collapse section" : "Expand section";

  return (
    <View className="mb-3 overflow-hidden rounded-xl border border-pillfly-line">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={expandHint}
        accessibilityState={{ expanded }}
        onPress={toggle}
        className={`min-h-[48px] flex-row items-center justify-between px-4 py-3.5 active:opacity-90 ${headerClassName}`}
      >
        <Text className="flex-1 text-[14px] font-bold text-pillfly-ink">{title}</Text>
        <Feather
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {!isMeasured ? (
        <View
          pointerEvents="none"
          collapsable={false}
          style={{ position: "absolute", left: 0, right: 0, opacity: 0, zIndex: -1 }}
          onLayout={(event) => handleMeasure(event.nativeEvent.layout.height)}
        >
          <View className="border-t border-pillfly-line px-4 py-3">{children}</View>
        </View>
      ) : null}

      {isMeasured ? (
        <Animated.View
          collapsable={false}
          className="overflow-hidden"
          style={{ height: animatedHeight }}
          accessibilityElementsHidden={!expanded}
          importantForAccessibility={expanded ? "yes" : "no-hide-descendants"}
        >
          <View className="border-t border-pillfly-line px-4 py-3" collapsable={false}>
            {children}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
});

Accordion.displayName = "Accordion";
