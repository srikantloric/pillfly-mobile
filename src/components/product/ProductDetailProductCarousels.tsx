import React, { memo, useMemo } from "react";
import { View } from "react-native";

import type { Product } from "@/types/product";
import { getProductDetailCarouselSections } from "@/utils/productDetailCarousels";

import { ProductDetailProductCarouselSection } from "./ProductDetailProductCarouselSection";

type Props = {
  productId: string;
  onPressViewAll?: (sectionTitle: string) => void;
  onPressProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

export const ProductDetailProductCarousels = memo(function ProductDetailProductCarousels({
  productId,
  onPressViewAll,
  onPressProduct,
  onAddToCart,
  onNotify,
}: Props) {
  const sections = useMemo(
    () => getProductDetailCarouselSections(productId),
    [productId],
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <View className="pb-2">
      {sections.map((section) => (
        <ProductDetailProductCarouselSection
          key={section.key}
          title={section.title}
          products={section.products}
          onPressViewAll={() => onPressViewAll?.(section.title)}
          onPressProduct={onPressProduct}
          onAddToCart={onAddToCart}
          onNotify={onNotify}
        />
      ))}
    </View>
  );
});

ProductDetailProductCarousels.displayName = "ProductDetailProductCarousels";
