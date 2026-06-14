import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
  getPdpHeroImageHeight,
} from "@/features/product/components";
import { PDP_HEADER_COLLAPSE_END, PDP_HORIZONTAL_PADDING } from "@/features/product/constants/productDetail.constants";
import { useMedicalSectionScroll } from "@/features/product/hooks/useMedicalSectionScroll";
import { useCartActions, useCartSummary } from "@/features/cart";
import type { ProductDetailShareChannelId } from "@/features/product/mocks/detail.mock";
import type { SavingsCoupon } from "@/mocks/savings.mock";
import { navigateToSharedRoute } from "@/navigation/navigateShared";
import type { AppStackParamList } from "@/types/navigation.types";
import type { Product } from "@/features/product/types/product";
import { getProductPlusCreditsAmount } from "@/features/product/utils/productDisplay";
import { shareProductOnChannel } from "@/features/product/utils/shareProduct";

type Props = {
  product: Product;
  navigation: NativeStackNavigationProp<AppStackParamList, "ProductDetail">;
  onReady: () => void;
};

export function ProductDetailContent({ product, navigation, onReady }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerCollapsedRef = useRef(false);
  const readySignalledRef = useRef(false);

  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(insets.top);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const {
    onMedicalAnchorLayout,
    onMedicalSectionLayout,
    onStickyHeaderLayout,
    onMedicalTabsLayout,
    scrollToMedicalSection,
  } = useMedicalSectionScroll({ scrollRef });

  const scrollPaddingBottom = insets.bottom + CART_STICKY_BAR_SCROLL_PADDING;

  const collapseThreshold = useMemo(() => {
    const heroHeight = stickyHeaderHeight + getPdpHeroImageHeight(windowWidth);
    return Math.min(PDP_HEADER_COLLAPSE_END, Math.max(96, heroHeight - stickyHeaderHeight - 48));
  }, [stickyHeaderHeight, windowWidth]);

  const signalReady = useCallback(() => {
    if (readySignalledRef.current) {
      return;
    }
    readySignalledRef.current = true;
    onReady();
  }, [onReady]);

  useEffect(() => {
    readySignalledRef.current = false;
    scrollY.setValue(0);
    headerCollapsedRef.current = false;
    setHeaderCollapsed(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const cancelSchedule = scheduleWhenIdle(() => {
      signalReady();
    });

    return cancelSchedule;
  }, [product.id, scrollY, signalReady]);

  const { itemCount, lineCount, stickyLabel } = useCartSummary();
  const { addToCart } = useCartActions();

  const showFeatureComingSoon = useCallback(() => {
    Alert.alert("Coming soon", "This feature will be available soon.");
  }, []);

  const onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onPressSearch = useCallback(() => {
    navigateToSharedRoute(navigation, "Search");
  }, [navigation]);

  const onPressCart = useCallback(() => {
    navigateToSharedRoute(navigation, "Cart");
  }, [navigation]);

  const onAddToCart = useCallback(() => {
    addToCart(product.id);
  }, [addToCart, product.id]);

  const onAddCarouselProductToCart = useCallback(
    (item: Product) => {
      addToCart(item.id);
    },
    [addToCart],
  );

  const onOpenProduct = useCallback(
    (item: Product) => {
      navigation.navigate("ProductDetail", { productId: item.id });
    },
    [navigation],
  );

  const onViewCart = useCallback(() => {
    navigateToSharedRoute(navigation, "Cart");
  }, [navigation]);

  const onPressShareChannel = useCallback(
    (channelId: ProductDetailShareChannelId) => {
      shareProductOnChannel(channelId, product.title).catch(() => undefined);
    },
    [product.title],
  );

  const onPressOfferCoupon = useCallback(
    (_coupon: SavingsCoupon) => {
      showFeatureComingSoon();
    },
    [showFeatureComingSoon],
  );

  const plusCredits = useMemo(() => getProductPlusCreditsAmount(product), [product]);

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
          cartBadgeCount={lineCount}
          onPressBack={onPressBack}
          onPressOffers={showFeatureComingSoon}
          onPressSearch={onPressSearch}
          onPressCart={onPressCart}
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
      </Animated.ScrollView>

      {itemCount > 0 ? (
        <CartStickyBar
          itemCount={itemCount}
          label={stickyLabel}
          onPressViewCart={onViewCart}
        />
      ) : null}
    </View>
  );
}

function scheduleWhenIdle(callback: () => void): () => void {
  const idleScope = globalThis as typeof globalThis & {
    requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof idleScope.requestIdleCallback === "function") {
    const id = idleScope.requestIdleCallback(callback, { timeout: 500 });
    return () => {
      idleScope.cancelIdleCallback?.(id);
    };
  }

  const frameId = requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });

  return () => cancelAnimationFrame(frameId);
}
