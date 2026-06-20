import React, { memo, useCallback, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";

import { HomePromoBanner } from "@/components/home/HomePromoBanner";
import { CarouselDots, HorizontalPager } from "@/components/ui";
import {
  PRODUCT_DETAIL_PROMO_SLIDES,
  type ProductDetailPromoSlide,
} from "@/features/product/mocks/detail.mock";

import { ProductDetailPainSupportBanner } from "./ProductDetailPainSupportBanner";

const HORIZONTAL_GUTTER = 16;
const SLIDE_GAP = 12;

type Props = {
  slides?: readonly ProductDetailPromoSlide[];
  onPressPromoCta?: () => void;
};

export const ProductDetailPromoCarousel = memo(function ProductDetailPromoCarousel({
  slides: slidesProp,
  onPressPromoCta,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = windowWidth - HORIZONTAL_GUTTER * 2;
  const slides = useMemo(
    () => [...(slidesProp ?? PRODUCT_DETAIL_PROMO_SLIDES)],
    [slidesProp],
  );

  const renderSlide = useCallback(
    ({ item }: { item: ProductDetailPromoSlide }) => {
      if (item.type === "pain-support") {
        return (
          <View style={{ width: slideWidth }}>
            <ProductDetailPainSupportBanner onPressCta={onPressPromoCta} />
          </View>
        );
      }

      return (
        <View style={{ width: slideWidth }}>
          <HomePromoBanner source={item.source} />
        </View>
      );
    },
    [onPressPromoCta, slideWidth],
  );

  return (
    <View className="mt-4 bg-pillfly-background pb-2">
      <HorizontalPager
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderSlide({ item })}
        slideWidth={slideWidth}
        itemGap={SLIDE_GAP}
        pagingEnabled={false}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerClassName="gap-3 px-4"
      >
        {({ activeIndex }) => (
          <CarouselDots
            count={slides.length}
            activeIndex={activeIndex}
            variant="primary"
            className="mt-3"
          />
        )}
      </HorizontalPager>
    </View>
  );
});

ProductDetailPromoCarousel.displayName = "ProductDetailPromoCarousel";
