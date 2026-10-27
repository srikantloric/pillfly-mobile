import React, { memo, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { BulletList, HorizontalScrollRow, ReadMoreText } from "@/components/ui";
import type { Product } from "@/features/product/types/product";
import {
  MEDICAL_INFO_TABS,
  getProductMedicalDescription,
  getProductMedicalSections,
  hasProductMedicalContent,
  type MedicalInfoTabId,
} from "@/features/product/utils/productMedicalContent";
import { colors } from "@/theme";

import {
  PDP_BODY_TEXT_CLASS,
  PDP_DIVIDER,
  PDP_HORIZONTAL_PADDING,
  PDP_ROW_PADDING,
  PDP_SECTION_SPACING,
  PDP_SECTION_TITLE_CLASS,
} from "../constants/productDetail.constants";

const SECTION_ICONS: Record<MedicalInfoTabId, React.ReactNode> = {
  uses: <Ionicons name="medkit" size={18} color={colors.primary} />,
  contraindications: <Feather name="slash" size={18} color={colors.promoRed} />,
  sideEffects: <Ionicons name="sad-outline" size={18} color={colors.textSecondary} />,
  precautions: <Feather name="alert-triangle" size={18} color={colors.textSecondary} />,
};

type Props = {
  product: Product;
  onSectionLayout?: (tabId: MedicalInfoTabId, sectionY: number) => void;
  onTabsLayout?: (height: number) => void;
  onTabPress?: (tabId: MedicalInfoTabId) => void;
};

export const ProductDetailMedicalContent = memo(function ProductDetailMedicalContent({
  product,
  onSectionLayout,
  onTabsLayout,
  onTabPress,
}: Props) {
  const description = getProductMedicalDescription(product);
  const sections = useMemo(() => getProductMedicalSections(product), [product]);
  const visibleTabs = useMemo(
    () => MEDICAL_INFO_TABS.filter((tab) => sections.some((section) => section.id === tab.id)),
    [sections],
  );
  const [activeTabId, setActiveTabId] = useState<MedicalInfoTabId>(visibleTabs[0]?.id ?? "uses");

  if (!hasProductMedicalContent(product)) {
    return null;
  }

  return (
    <View className={`${PDP_SECTION_SPACING} bg-pillfly-background`}>
      {description ? (
        <View className={`${PDP_DIVIDER} bg-pillfly-surface ${PDP_HORIZONTAL_PADDING} ${PDP_ROW_PADDING}`}>
          <Text className={`mb-3 ${PDP_SECTION_TITLE_CLASS}`}>Medical description</Text>
          <ReadMoreText text={description} collapsedLines={3} textClassName={PDP_BODY_TEXT_CLASS} />
        </View>
      ) : null}

      {visibleTabs.length > 0 ? (
        <>
          <View
            className="border-b border-pillfly-line bg-pillfly-surface"
            onLayout={(event) => onTabsLayout?.(event.nativeEvent.layout.height)}
          >
            <HorizontalScrollRow contentClassName="px-4" gapClassName="gap-5">
              {visibleTabs.map((tab) => {
                const active = tab.id === activeTabId;
                return (
                  <Pressable
                    key={tab.id}
                    accessibilityRole="tab"
                    accessibilityLabel={tab.label}
                    accessibilityHint={active ? undefined : "Scroll to this section"}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      setActiveTabId(tab.id);
                      onTabPress?.(tab.id);
                    }}
                    className="min-h-[44px] pb-3 pt-3 active:opacity-80"
                  >
                    <Text
                      className={`text-[14px] font-semibold ${
                        active ? "text-pillfly-primary" : "text-pillfly-muted"
                      }`}
                    >
                      {tab.label}
                    </Text>
                    <View
                      className={`mt-2 h-[3px] ${active ? "w-full rounded-full bg-pillfly-primary" : "bg-transparent"}`}
                    />
                  </Pressable>
                );
              })}
            </HorizontalScrollRow>
          </View>

          {sections.map((section) => (
            <View
              key={section.id}
              onLayout={(event) => onSectionLayout?.(section.id, event.nativeEvent.layout.y)}
              className="border-b border-pillfly-line bg-pillfly-surface px-4 py-3.5"
            >
              <View className="mb-3 flex-row items-center gap-2.5">
                <View
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  className="h-7 w-7 items-center justify-center rounded-full bg-pillfly-background"
                >
                  {SECTION_ICONS[section.id]}
                </View>
                <Text className="text-[14px] font-bold text-pillfly-ink">{section.title}</Text>
              </View>
              <BulletList items={section.bullets} />
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
});
