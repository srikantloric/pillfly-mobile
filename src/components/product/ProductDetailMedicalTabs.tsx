import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { HorizontalScrollRow } from "@/components/ui";
import type { MedicalInfoTab, MedicalInfoTabId } from "@/utils/productMedicalContent";

type Props = {
  tabs: readonly MedicalInfoTab[];
  activeTabId: MedicalInfoTabId;
  onTabPress: (tabId: MedicalInfoTabId) => void;
  onLayoutHeight?: (height: number) => void;
};

export const ProductDetailMedicalTabs = memo(function ProductDetailMedicalTabs({
  tabs,
  activeTabId,
  onTabPress,
  onLayoutHeight,
}: Props) {
  return (
    <View
      className="border-b border-pillfly-line bg-pillfly-surface"
      onLayout={(event) => onLayoutHeight?.(event.nativeEvent.layout.height)}
    >
      <HorizontalScrollRow contentClassName="px-4" gapClassName="gap-5">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityHint={active ? undefined : "Scroll to this section"}
              accessibilityState={{ selected: active }}
              onPress={() => onTabPress(tab.id)}
              className="min-h-[44px] pb-3 pt-3 active:opacity-80"
            >
              <Text
                className={`text-[14px] font-semibold ${
                  active ? "text-pillfly-primary" : "text-pillfly-muted"
                }`}
              >
                {tab.label}
              </Text>
              {active ? (
                <View className="mt-2 h-[3px] w-full rounded-full bg-pillfly-primary" />
              ) : (
                <View className="mt-2 h-[3px] bg-transparent" />
              )}
            </Pressable>
          );
        })}
      </HorizontalScrollRow>
    </View>
  );
});

ProductDetailMedicalTabs.displayName = "ProductDetailMedicalTabs";
