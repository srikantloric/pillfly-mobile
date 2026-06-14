import React, { memo, useCallback, useMemo } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { ProductImageWithPlaceholder } from "@/features/search/components";
import { CarouselDots, HorizontalPager } from "@/components/ui";
import type { Product } from "@/features/product/types/product";
import { getProductImages, isProductInStock } from "@/features/product/utils/productDisplay";
import { colors } from "@/theme";

import {
  PDP_FAB_SHADOW,
  PDP_HERO_IMAGE_ASPECT,
  PDP_HERO_IMAGE_HORIZONTAL_PADDING,
} from "../constants/productDetail.constants";

const FAB_SIZE = 40;

type Props = {
  product: Product;
  /** Sticky header height — reserved as white toolbar space (reference 1.jpeg). */
  headerOverlayHeight?: number;
  onPressWishlist?: () => void;
  onPressShare?: () => void;
};

export function getPdpHeroImageHeight(windowWidth: number): number {
  return Math.round(windowWidth * PDP_HERO_IMAGE_ASPECT);
}

export const ProductImageCarousel = memo(function ProductImageCarousel({
  product,
  headerOverlayHeight = 0,
  onPressWishlist,
  onPressShare,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = windowWidth;
  const imageHeight = getPdpHeroImageHeight(windowWidth);
  const imageContentWidth = slideWidth - PDP_HERO_IMAGE_HORIZONTAL_PADDING * 2;

  const imageUrls = useMemo(() => getProductImages(product), [product]);
  const slides = imageUrls.length > 0 ? imageUrls : [undefined];
  const inStock = isProductInStock(product);

  const renderSlide = useCallback(
    ({ item }: { item: string | undefined }) => (
      <View
        style={{ width: slideWidth, height: imageHeight }}
        className="items-center justify-center bg-pillfly-surface"
      >
        <ProductImageWithPlaceholder
          uri={item}
          dimmed={!inStock}
          className=""
          style={{ width: imageContentWidth, height: imageHeight }}
          resizeMode="contain"
        />
      </View>
    ),
    [imageContentWidth, imageHeight, inStock, slideWidth],
  );

  return (
    <View className="bg-pillfly-surface">
      {/* White header reserve — icons overlay this, not the product photo (ref 1.jpeg). */}
      {headerOverlayHeight > 0 ? (
        <View style={{ height: headerOverlayHeight }} className="bg-pillfly-surface" />
      ) : null}

      <View className="relative bg-pillfly-surface">
        <HorizontalPager
          data={slides}
          keyExtractor={(_, index) => `slide-${index}`}
          renderItem={({ item }) => renderSlide({ item })}
          slideWidth={slideWidth}
        >
          {({ activeIndex }) => (
            <CarouselDots
              count={slides.length}
              activeIndex={activeIndex}
              variant="primary"
              className="absolute bottom-3 left-0 right-0"
            />
          )}
        </HorizontalPager>

        <View
          className="absolute right-4 gap-2.5"
          style={{ top: imageHeight * 0.28 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add to wishlist"
            onPress={onPressWishlist}
            className="items-center justify-center rounded-full border border-pillfly-line bg-pillfly-surface active:opacity-90"
            style={{
              width: FAB_SIZE,
              height: FAB_SIZE,
              ...PDP_FAB_SHADOW,
            }}
          >
            <Feather
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              name="heart"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share product"
            onPress={onPressShare}
            className="items-center justify-center rounded-full border border-pillfly-line bg-pillfly-surface active:opacity-90"
            style={{
              width: FAB_SIZE,
              height: FAB_SIZE,
              ...PDP_FAB_SHADOW,
            }}
          >
            <Feather
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              name="share-2"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

ProductImageCarousel.displayName = "ProductImageCarousel";
