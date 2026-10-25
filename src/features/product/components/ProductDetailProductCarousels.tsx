import React, { memo, useCallback, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";

import { HorizontalScrollRow, SectionHeaderRow } from "@/components/ui";
import { SearchResultProductCard } from "@/features/search/components/SearchResultProductCard";
import type { Product } from "@/features/product/types/product";
import { getProductDetailCarouselSections } from "@/features/product/utils/productDetailCarousels";

import {
  PDP_CAROUSEL_CARD_GAP,
  PDP_CAROUSEL_CARD_WIDTH,
  PDP_HORIZONTAL_PADDING,
  PDP_SECTION_SPACING,
} from "../constants/productDetail.constants";

type ProductHandlers = {
  onPressProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

/** Binds the product to `onPress` so the memoised card only re-renders when its product changes. */
const CarouselProductCard = memo(function CarouselProductCard({
  product,
  width,
  onPressProduct,
  onAddToCart,
  onNotify,
}: ProductHandlers & { product: Product; width: number }) {
  const onPress = useCallback(() => onPressProduct?.(product), [onPressProduct, product]);

  return (
    <SearchResultProductCard
      product={product}
      width={width}
      fillHeight={false}
      containerClassName="rounded-xl"
      onPress={onPress}
      onAddToCart={onAddToCart}
      onNotify={onNotify}
    />
  );
});

type Props = ProductHandlers & {
  productId: string;
  onPressViewAll?: (sectionTitle: string) => void;
};

export const ProductDetailProductCarousels = memo(function ProductDetailProductCarousels({
  productId,
  onPressViewAll,
  ...handlers
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(PDP_CAROUSEL_CARD_WIDTH, Math.round(windowWidth * 0.38));
  const sections = useMemo(() => getProductDetailCarouselSections(productId), [productId]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <View className="pb-2">
      {sections.map((section) => (
        <View key={section.key} className={`${PDP_SECTION_SPACING} bg-pillfly-background`}>
          <View className={PDP_HORIZONTAL_PADDING}>
            <SectionHeaderRow
              title={section.title}
              actionLabel="View All"
              showActionChevron
              onPressAction={() => onPressViewAll?.(section.title)}
              className="mb-3"
            />
          </View>

          <HorizontalScrollRow
            contentClassName={`${PDP_HORIZONTAL_PADDING} pb-3`}
            gapClassName={PDP_CAROUSEL_CARD_GAP}
          >
            {section.products.map((item) => (
              <CarouselProductCard key={item.id} product={item} width={cardWidth} {...handlers} />
            ))}
          </HorizontalScrollRow>
        </View>
      ))}
    </View>
  );
});
