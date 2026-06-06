import { useCallback, useRef, type RefObject } from "react";
import type { ScrollView } from "react-native";

import type { MedicalInfoTabId } from "@/utils/productMedicalContent";

type Options = {
  scrollRef: RefObject<ScrollView | null>;
};

/**
 * Tracks medical block position in scroll content and scrolls sections
 * below the fixed PDP header and tab strip (measured, not hardcoded).
 */
export function useMedicalSectionScroll({ scrollRef }: Options) {
  const medicalAnchorY = useRef(0);
  const sectionOffsets = useRef<Partial<Record<MedicalInfoTabId, number>>>({});
  const stickyHeaderHeight = useRef(0);
  const medicalTabsHeight = useRef(0);


  const onMedicalAnchorLayout = useCallback((y: number) => {
    medicalAnchorY.current = y;
  }, []);

  const onMedicalSectionLayout = useCallback((tabId: MedicalInfoTabId, sectionY: number) => {
    console.log("SECTION LAYOUT:", tabId, sectionY);
    sectionOffsets.current[tabId] = medicalAnchorY.current + sectionY;
  }, []);

  const onStickyHeaderLayout = useCallback((height: number) => {
    stickyHeaderHeight.current = height;
  }, []);


  const onMedicalTabsLayout = useCallback((height: number) => {
    medicalTabsHeight.current = height;
  }, []);

  const scrollToMedicalSection = useCallback((tabId: MedicalInfoTabId) => {
    console.log("TAB CLICK:", tabId);
    console.log("TARGET:", sectionOffsets.current[tabId]);
    const sectionY = sectionOffsets.current[tabId];
    if (sectionY == null) {
      console.log("NO POSITION FOUND");
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
