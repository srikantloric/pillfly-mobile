import { useCallback, useRef, type RefObject } from "react";
import type { ScrollView } from "react-native";

import type { MedicalInfoTabId } from "@/features/product/utils/productMedicalContent";

type Options = {
  scrollRef: RefObject<ScrollView | null>;
};

export function useMedicalSectionScroll({ scrollRef }: Options) {
  const medicalAnchorY = useRef(0);
  const sectionOffsets = useRef<Partial<Record<MedicalInfoTabId, number>>>({});
  const stickyHeaderHeight = useRef(0);
  const medicalTabsHeight = useRef(0);

  const onMedicalAnchorLayout = useCallback((y: number) => {
    medicalAnchorY.current = y;
  }, []);

  const onMedicalSectionLayout = useCallback((tabId: MedicalInfoTabId, sectionY: number) => {
    sectionOffsets.current[tabId] = medicalAnchorY.current + sectionY;
  }, []);

  const onStickyHeaderLayout = useCallback((height: number) => {
    stickyHeaderHeight.current = height;
  }, []);

  const onMedicalTabsLayout = useCallback((height: number) => {
    medicalTabsHeight.current = height;
  }, []);

  const scrollToMedicalSection = useCallback((tabId: MedicalInfoTabId) => {
    const sectionY = sectionOffsets.current[tabId];
    if (sectionY == null) {
      return;
    }

    const scrollY =
      sectionY - stickyHeaderHeight.current - medicalTabsHeight.current;

    scrollRef.current?.scrollTo({
      y: Math.max(0, scrollY),
      animated: true,
    });
  }, [scrollRef]);

  return {
    onMedicalAnchorLayout,
    onMedicalSectionLayout,
    onStickyHeaderLayout,
    onMedicalTabsLayout,
    scrollToMedicalSection,
  };
}
