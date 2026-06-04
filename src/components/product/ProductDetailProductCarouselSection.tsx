import React, { memo, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";

import { SearchResultProductCard } from "@/components/search";
import { HorizontalScrollRow, SectionHeaderRow } from "@/components/ui";
import type { Product } from "@/types/product";

/** Reference PDP horizontal product card width (~132–148px). */
export const PDP_CAROUSEL_CARD_WIDTH = 148;

type Props = {
  title: string;
  products: Product[];
  onPressViewAll?: () => void;
  onPressProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

export const ProductDetailProductCarouselSection = memo(
  function ProductDetailProductCarouselSection({
    title,
    products,
    onPressViewAll,
    onPressProduct,
    onAddToCart,
    onNotify,
  }: Props) {
    const { width: windowWidth } = useWindowDimensions();
    const cardWidth = useMemo(
      () => Math.min(PDP_CAROUSEL_CARD_WIDTH, Math.round(windowWidth * 0.4)),
      [windowWidth],
    );

    if (products.length === 0) {
      return null;
    }

    return (
      <View className="mt-5 bg-pillfly-background">
        <View className="px-4">
          <SectionHeaderRow
            title={title}
            actionLabel="View All"
            showActionChevron
            onPressAction={onPressViewAll}
            className="mb-3"
          />
        </View>

        <HorizontalScrollRow contentClassName="px-4 pb-4" gapClassName="gap-3">
          {products.map((item) => (
            <SearchResultProductCard
              key={item.id}
              product={item}
              width={cardWidth}
              containerClassName="rounded-xl"
              onPress={() => onPressProduct?.(item)}
              onAddToCart={onAddToCart}
              onNotify={onNotify}
            />
          ))}
        </HorizontalScrollRow>
      </View>
    );
  },
);

ProductDetailProductCarouselSection.displayName = "ProductDetailProductCarouselSection";
