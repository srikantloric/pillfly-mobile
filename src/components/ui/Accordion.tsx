import React, { memo, useCallback, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

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

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View className="mx-4 mb-3 overflow-hidden rounded-xl border border-pillfly-line">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={toggle}
        className={`flex-row items-center justify-between px-4 py-3.5 active:opacity-90 ${headerClassName}`}
      >
        <Text className="flex-1 text-[14px] font-bold text-pillfly-ink">{title}</Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.primary}
        />
      </Pressable>
      {expanded ? <View className="border-t border-pillfly-line px-4 py-3">{children}</View> : null}
    </View>
  );
});

Accordion.displayName = "Accordion";
