import React, { useCallback } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartStickyBar } from "@/components/cart";
import {
  ProductDetailHeader,
  ProductDetailMembershipBanner,
  ProductDetailMetaSections,
  ProductDetailProductCarousels,
  ProductImageCarousel,
  ProductInformationCard,
} from "@/components/product";
import { useProductDetail } from "@/hooks/useProductDetail";
import { MOCK_CART_SUMMARY } from "@/mocks/search.mock";
import type { AppStackParamList } from "@/types/navigation.types";
import type { Product } from "@/types/product";
import { getProductPlusCreditsAmount } from "@/utils/productDisplay";
import { colors, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "ProductDetail">;

const STICKY_FOOTER_HEIGHT = 64;
const HEADER_BODY_HEIGHT = 48;

export function ProductDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { product, loading, error } = useProductDetail(route.params.productId);

  const scrollPaddingBottom = insets.bottom + STICKY_FOOTER_HEIGHT + spacing.md;

  const showFeatureComingSoon = useCallback(() => {
    Alert.alert("Coming soon", "This feature will be available soon.");
  }, []);

  const onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onAddToCart = useCallback(() => {
    showFeatureComingSoon();
  }, [showFeatureComingSoon]);

  const onAddCarouselProductToCart = useCallback(
    (_item: Product) => {
      showFeatureComingSoon();
    },
    [showFeatureComingSoon],
  );

  const onOpenProduct = useCallback(
    (item: Product) => {
      navigation.navigate("ProductDetail", { productId: item.id });
    },
    [navigation],
  );

  const plusCredits = product ? getProductPlusCreditsAmount(product) : 2;

  return (
    <View className="flex-1 bg-pillfly-background">
      <View className="absolute left-0 right-0 top-0 z-20">
        <ProductDetailHeader
          cartBadgeCount={MOCK_CART_SUMMARY.itemCount}
          onPressBack={onPressBack}
          onPressOffers={showFeatureComingSoon}
          onPressSearch={showFeatureComingSoon}
          onPressCart={showFeatureComingSoon}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + HEADER_BODY_HEIGHT,
          paddingBottom: scrollPaddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-3 text-[14px] text-pillfly-muted">Loading product…</Text>
          </View>
        ) : null}

        {error ? (
          <View className="mx-4 mb-3 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-5">
            <Text className="text-center text-[14px] text-pillfly-promo-red">{error.message}</Text>
          </View>
        ) : null}

        {product ? (
          <>
            <ProductImageCarousel
              product={product}
              onPressWishlist={showFeatureComingSoon}
              onPressShare={showFeatureComingSoon}
            />
            <ProductInformationCard
              product={product}
              onAddToCart={onAddToCart}
              onNotify={showFeatureComingSoon}
            />
            <View className="bg-pillfly-surface px-4 pb-4">
              <ProductDetailMembershipBanner
                creditsAmount={plusCredits}
                onPressViewBenefits={showFeatureComingSoon}
                onPressAddPlus={showFeatureComingSoon}
              />
            </View>

            <ProductDetailMetaSections
              product={product}
              onPressChangePincode={showFeatureComingSoon}
              onPressReturnPolicy={showFeatureComingSoon}
              onPressComposition={showFeatureComingSoon}
              onPressTherapeutic={showFeatureComingSoon}
              onPressPromoCta={showFeatureComingSoon}
            />

            <ProductDetailProductCarousels
              productId={product.id}
              onPressViewAll={showFeatureComingSoon}
              onPressProduct={onOpenProduct}
              onAddToCart={onAddCarouselProductToCart}
              onNotify={showFeatureComingSoon}
            />
          </>
        ) : null}
      </ScrollView>

      <CartStickyBar
        itemCount={MOCK_CART_SUMMARY.itemCount}
        label={MOCK_CART_SUMMARY.label}
        onPressViewCart={showFeatureComingSoon}
      />
    </View>
  );
}
