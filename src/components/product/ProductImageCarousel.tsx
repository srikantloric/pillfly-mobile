import React, { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { ProductImageWithPlaceholder } from "@/components/search/ProductImageWithPlaceholder";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const inStock = isProductInStock(product);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
      setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));
    },
    [slideWidth, slides.length],
  );

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
      <FlatList
        data={slides}
        keyExtractor={(_, index) => `slide-${index}`}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        bounces={slides.length > 1}
        scrollEnabled={slides.length > 1}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
      />

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
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
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
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Feather name="share-2" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {slides.length > 1 ? (
        <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-1.5">
          {slides.map((_, index) => {
            const active = index === activeIndex;
            return (
              <View
                key={index}
                className={active ? "rounded-full bg-pillfly-primary" : "rounded-full bg-pillfly-line"}
                style={{
                  width: active ? 18 : 6,
                  height: 6,
                }}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
});

ProductImageCarousel.displayName = "ProductImageCarousel";
