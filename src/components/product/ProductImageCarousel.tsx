import React, { memo, useCallback, useMemo } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { ProductImageWithPlaceholder } from "@/components/search/ProductImageWithPlaceholder";
import { CarouselDots, HorizontalPager } from "@/components/ui";
import type { Product } from "@/types/product";
import { getProductImages, isProductInStock } from "@/utils/productDisplay";
import { colors } from "@/theme";

const IMAGE_ASPECT = 0.88;
const FAB_SIZE = 40;

type Props = {
  product: Product;
  onPressWishlist?: () => void;
  onPressShare?: () => void;
};

export const ProductImageCarousel = memo(function ProductImageCarousel({
  product,
  onPressWishlist,
  onPressShare,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = windowWidth;
  const slideHeight = Math.round(slideWidth * IMAGE_ASPECT);

  const imageUrls = useMemo(() => getProductImages(product), [product]);
  const slides = imageUrls.length > 0 ? imageUrls : [undefined];
  const inStock = isProductInStock(product);

  const fabShadowStyle = {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  };

  const renderSlide = useCallback(
    ({ item }: { item: string | undefined }) => (
      <View
        style={{ width: slideWidth, height: slideHeight }}
        className="items-center justify-center bg-pillfly-surface"
      >
        <ProductImageWithPlaceholder
          uri={item}
          dimmed={!inStock}
          className="h-full w-full px-6"
        />
      </View>
    ),
    [inStock, slideHeight, slideWidth],
  );

  return (
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
        className="absolute right-3 gap-2.5"
        style={{ top: slideHeight * 0.38 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add to wishlist"
          onPress={onPressWishlist}
          className="items-center justify-center rounded-full border border-pillfly-line bg-pillfly-surface active:opacity-90"
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            ...fabShadowStyle,
          }}
        >
          <Feather name="heart" size={20} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share product"
          onPress={onPressShare}
          className="items-center justify-center rounded-full border border-pillfly-line bg-pillfly-surface active:opacity-90"
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            ...fabShadowStyle,
          }}
        >
          <Feather name="share-2" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
});

ProductImageCarousel.displayName = "ProductImageCarousel";
