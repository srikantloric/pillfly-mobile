import React from "react";
import { View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import type { MedicalInfoTabId } from "@/utils/productMedicalContent";
import { colors } from "@/theme";

const iconSlotProps = {
  accessible: false as const,
  importantForAccessibility: "no-hide-descendants" as const,
};

export function getMedicalSectionIcon(tabId: MedicalInfoTabId): React.ReactNode {
  switch (tabId) {
    case "uses":
      return (
        <View
          {...iconSlotProps}
          className="h-7 w-7 items-center justify-center rounded-full bg-pillfly-background"
        >
          <Ionicons name="medkit" size={18} color={colors.primary} />
        </View>
      );
    case "contraindications":
      return (
        <View
          {...iconSlotProps}
          className="h-7 w-7 items-center justify-center rounded-full bg-pillfly-background"
        >
          <Feather name="slash" size={18} color={colors.promoRed} />
        </View>
      );
    case "sideEffects":
      return (
        <View
          {...iconSlotProps}
          className="h-7 w-7 items-center justify-center rounded-full bg-pillfly-background"
        >
          <Ionicons name="sad-outline" size={18} color={colors.textSecondary} />
        </View>
      );
    case "precautions":
      return (
        <View
          {...iconSlotProps}
          className="h-7 w-7 items-center justify-center rounded-full bg-pillfly-background"
        >
          <Feather name="alert-triangle" size={18} color={colors.textSecondary} />
        </View>
      );
    default:
      return null;
  }
}
