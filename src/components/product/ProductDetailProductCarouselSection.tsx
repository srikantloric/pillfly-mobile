import React, { memo, useCallback, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";

import { SearchResultProductCard } from "@/components/search";
import { HorizontalScrollRow, SectionHeaderRow } from "@/components/ui";
import type { Product } from "@/types/product";

import {
  PDP_CAROUSEL_CARD_GAP,
  PDP_CAROUSEL_CARD_WIDTH,
  PDP_HORIZONTAL_PADDING,
  PDP_SECTION_SPACING,
} from "./productDetail.constants";

type Props = {
  title: string;
  products: Product[];
  onPressViewAll?: () => void;
  onPressProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

type CarouselCardProps = {
  product: Product;
  width: number;
  onPressProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product) => void;
};

const CarouselProductCard = memo(function CarouselProductCard({
  product,
  width,
  onPressProduct,
  onAddToCart,
  onNotify,
}: CarouselCardProps) {
  const onPress = useCallback(() => {
    onPressProduct?.(product);
  }, [onPressProduct, product]);

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

CarouselProductCard.displayName = "CarouselProductCard";

export const ProductDetailProductCarouselSection = memo(function ProductDetailProductCarouselSection({
  title,
  products,
  onPressViewAll,
  onPressProduct,
  onAddToCart,
  onNotify,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = useMemo(
    () => Math.min(PDP_CAROUSEL_CARD_WIDTH, Math.round(windowWidth * 0.38)),
    [windowWidth],
  );

  const handleViewAll = useCallback(() => {
    onPressViewAll?.();
  }, [onPressViewAll]);

  if (products.length === 0) {
    return null;
  }

  return (
    <View className={`${PDP_SECTION_SPACING} bg-pillfly-background`}>
      <View className={PDP_HORIZONTAL_PADDING}>
        <SectionHeaderRow
          title={title}
          actionLabel="View All"
          showActionChevron
          onPressAction={handleViewAll}
          className="mb-3"
        />
      </View>

      <HorizontalScrollRow
        contentClassName={`${PDP_HORIZONTAL_PADDING} pb-3`}
        gapClassName={PDP_CAROUSEL_CARD_GAP}
      >
        {products.map((item) => (
          <CarouselProductCard
            key={item.id}
            product={item}
            width={cardWidth}
            onPressProduct={onPressProduct}
            onAddToCart={onAddToCart}
            onNotify={onNotify}
          />
        ))}
      </HorizontalScrollRow>
    </View>
  );
});

ProductDetailProductCarouselSection.displayName = "ProductDetailProductCarouselSection";