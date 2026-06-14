import React, { memo } from "react";
import { View } from "react-native";

import type { SavingsCoupon } from "@/mocks/savings.mock";
import type { ProductDetailShareChannelId } from "@/features/product/mocks/detail.mock";

import { ProductDetailDisclaimer } from "./ProductDetailDisclaimer";
import { ProductDetailOffersSection } from "./ProductDetailOffersSection";
import { ProductDetailShareSection } from "./ProductDetailShareSection";

type Props = {
  onPressCoupon?: (coupon: SavingsCoupon) => void;
  onPressShareChannel?: (channelId: ProductDetailShareChannelId) => void;
};

export const ProductDetailFooterSections = memo(function ProductDetailFooterSections({
  onPressCoupon,
  onPressShareChannel,
}: Props) {
  return (
    <View>
      <ProductDetailOffersSection onPressCoupon={onPressCoupon} />
      <ProductDetailShareSection onPressChannel={onPressShareChannel} />
      <ProductDetailDisclaimer />
    </View>
  );
});

ProductDetailFooterSections.displayName = "ProductDetailFooterSections";
