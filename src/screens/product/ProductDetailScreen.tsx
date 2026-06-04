import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CART_STICKY_BAR_SCROLL_PADDING, CartStickyBar } from "@/components/cart";
import {
  ProductDetailAccordionSections,
  ProductDetailFooterSections,
  ProductDetailHeader,
  ProductDetailMembershipBanner,
  ProductDetailMedicalContent,
  ProductDetailMetaSections,
  ProductDetailOfferFootnote,
  ProductDetailProductCarousels,
  ProductImageCarousel,
  ProductInformationCard,
} from "@/components/product";
import {
  PDP_HEADER_COLLAPSE_END,
  PDP_HORIZONTAL_PADDING,
} from "@/components/product/productDetail.constants";
import { useMedicalSectionScroll } from "@/hooks/useMedicalSectionScroll";
import { useProductDetail } from "@/hooks/useProductDetail";
import type { ProductDetailShareChannelId } from "@/mocks/productDetail.mock";
import { MOCK_CART_SUMMARY } from "@/mocks/search.mock";
import type { SavingsCoupon } from "@/mocks/savings.mock";
import { navigateToSharedRoute } from "@/navigation/navigateShared";
import type { AppStackParamList } from "@/types/navigation.types";
import type { Product } from "@/types/product";
import { colors } from "@/theme";
import { getProductPlusCreditsAmount } from "@/utils/productDisplay";
import { shareProductOnChannel } from "@/utils/shareProduct";

type Props = NativeStackScreenProps<AppStackParamList, "ProductDetail">;

const IMAGE_ASPECT = 0.88;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerCollapsedRef = useRef(false);

  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(insets.top);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const productId = route.params.productId;
  const { product, loading, error } = useProductDetail(productId);

  const {
    onMedicalAnchorLayout,
    onMedicalSectionLayout,
    onStickyHeaderLayout,
    onMedicalTabsLayout,
    scrollToMedicalSection,
  } = useMedicalSectionScroll({ scrollRef });

  const scrollPaddingBottom = insets.bottom + CART_STICKY_BAR_SCROLL_PADDING;

  const collapseThreshold = useMemo(() => {
    const imageHeight = Math.round(windowWidth * IMAGE_ASPECT);
    return Math.min(PDP_HEADER_COLLAPSE_END, Math.max(96, imageHeight - stickyHeaderHeight - 48));
  }, [stickyHeaderHeight, windowWidth]);

  useEffect(() => {
    scrollY.setValue(0);
    headerCollapsedRef.current = false;
    setHeaderCollapsed(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [productId, scrollY]);

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

  const onViewCart = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) {
      navigateToSharedRoute(parent, "Cart");
    }
  }, [navigation]);

  const onPressShareChannel = useCallback(
    (channelId: ProductDetailShareChannelId) => {
      if (!product) {
        return;
      }
      shareProductOnChannel(channelId, product.title).catch(() => undefined);
    },
    [product],
  );

  const onPressOfferCoupon = useCallback(
    (_coupon: SavingsCoupon) => {
      showFeatureComingSoon();
    },
    [showFeatureComingSoon],
  );

  const plusCredits = useMemo(
    () => (product ? getProductPlusCreditsAmount(product) : 2),
    [product],
  );

  const handleStickyHeaderLayout = useCallback(
    (height: number) => {
      setStickyHeaderHeight(height);
      onStickyHeaderLayout(height);
    },
    [onStickyHeaderLayout],
  );

  const updateHeaderCollapsed = useCallback(
    (offsetY: number) => {
      const collapsed = offsetY >= collapseThreshold;
      if (headerCollapsedRef.current === collapsed) {
        return;
      }
      headerCollapsedRef.current = collapsed;
      setHeaderCollapsed(collapsed);
    },
    [collapseThreshold],
  );

  const onScrollListener = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateHeaderCollapsed(event.nativeEvent.contentOffset.y);
    },
    [updateHeaderCollapsed],
  );

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: onScrollListener,
      }),
    [onScrollListener, scrollY],
  );

  return (
    <View className="flex-1 bg-pillfly-background">
      <View
        className="absolute left-0 right-0 top-0 z-30"
        onLayout={(event) => handleStickyHeaderLayout(event.nativeEvent.layout.height)}
      >
        <ProductDetailHeader
          scrollY={scrollY}
          headerCollapsed={headerCollapsed}
          product={product}
          cartBadgeCount={MOCK_CART_SUMMARY.itemCount}
          onPressBack={onPressBack}
          onPressOffers={showFeatureComingSoon}
          onPressSearch={showFeatureComingSoon}
          onPressCart={showFeatureComingSoon}
          onAddToCart={onAddToCart}
          onNotify={showFeatureComingSoon}
        />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        scrollEventThrottle={16}
        onScroll={onScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
      >
        {loading ? (
          <View className="items-center py-12" style={{ paddingTop: stickyHeaderHeight }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-3 text-[14px] text-pillfly-muted">Loading product…</Text>
          </View>
        ) : null}

        {error ? (
          <View
            className={`mb-3 ${PDP_HORIZONTAL_PADDING}`}
            style={{ paddingTop: stickyHeaderHeight }}
          >
            <View className="rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-5">
              <Text className="text-center text-[14px] text-pillfly-promo-red">{error.message}</Text>
            </View>
          </View>
        ) : null}

        {product ? (
          <>
            <ProductImageCarousel
              product={product}
              headerOverlayHeight={stickyHeaderHeight}
              onPressWishlist={showFeatureComingSoon}
              onPressShare={showFeatureComingSoon}
            />

            <ProductInformationCard
              product={product}
              onAddToCart={onAddToCart}
              onNotify={showFeatureComingSoon}
            />

            <View className={`bg-pillfly-surface ${PDP_HORIZONTAL_PADDING} pb-4`}>
              <ProductDetailMembershipBanner
                creditsAmount={plusCredits}
                onPressViewBenefits={showFeatureComingSoon}
                onPressAddPlus={showFeatureComingSoon}
              />
              <ProductDetailOfferFootnote />
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
            

            <View onLayout={(event) => onMedicalAnchorLayout(event.nativeEvent.layout.y)}>
              <ProductDetailMedicalContent
                product={product}
                onSectionLayout={onMedicalSectionLayout}
                onTabsLayout={onMedicalTabsLayout}
                onTabPress={scrollToMedicalSection}
              />
            </View>

            <ProductDetailAccordionSections product={product} />

            <ProductDetailFooterSections
              onPressCoupon={onPressOfferCoupon}
              onPressShareChannel={onPressShareChannel}
            />
          </>
        ) : null}
      </Animated.ScrollView>

      <CartStickyBar
        itemCount={MOCK_CART_SUMMARY.itemCount}
        label={MOCK_CART_SUMMARY.label}
        onPressViewCart={onViewCart}
      />
    </View>
  );
}
