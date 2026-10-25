import React, { memo } from "react";
import { View, useWindowDimensions } from "react-native";

import { CarouselDots, HomePromoBanner, HorizontalPager } from "@/components/ui";
import { PRODUCT_DETAIL_PROMO_SLIDES } from "@/features/product/mocks/detail.mock";

import { ProductDetailPainSupportBanner } from "./ProductDetailPainSupportBanner";

const HORIZONTAL_GUTTER = 16;
const SLIDE_GAP = 12;
const SLIDES = [...PRODUCT_DETAIL_PROMO_SLIDES];

export const ProductDetailPromoCarousel = memo(function ProductDetailPromoCarousel({
  onPressPromoCta,
}: {
  onPressPromoCta?: () => void;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = windowWidth - HORIZONTAL_GUTTER * 2;

  return (
    <View className="mt-4 bg-pillfly-background pb-2">
      <HorizontalPager
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: slideWidth }}>
            {item.type === "pain-support" ? (
              <ProductDetailPainSupportBanner onPressCta={onPressPromoCta} />
            ) : (
              <HomePromoBanner source={item.source} />
            )}
          </View>
        )}
        slideWidth={slideWidth}
        itemGap={SLIDE_GAP}
        pagingEnabled={false}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerClassName="gap-3 px-4"
      >
        {({ activeIndex }) => (
          <CarouselDots
            count={SLIDES.length}
            activeIndex={activeIndex}
            variant="primary"
            className="mt-3"
          />
        )}
      </HorizontalPager>
    </View>
  );
});
