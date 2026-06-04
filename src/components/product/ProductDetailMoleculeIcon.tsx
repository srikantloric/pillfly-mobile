import React, { memo } from "react";
import { View } from "react-native";

export const ProductDetailMoleculeIcon = memo(function ProductDetailMoleculeIcon() {
  return (
    <View className="h-8 w-8 flex-row flex-wrap content-center justify-center gap-1">
      {[0, 1, 2, 3].map((index) => (
        <View key={index} className="h-[9px] w-[9px] rounded-full bg-pillfly-primary" />
      ))}
    </View>
  );
});

ProductDetailMoleculeIcon.displayName = "ProductDetailMoleculeIcon";
