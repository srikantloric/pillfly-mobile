import React, { memo } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import {
  HEADER_HIT_SLOP,
  HEADER_ICON_SLOT_CLASS,
} from "@/components/header/appHeader.constants";
import { formatCartBadgeCount } from "@/components/header/header.utils";
import { OutlineButton, PrimaryButton } from "@/components/ui";
import type { Product } from "@/types/product";
import {
  formatInr,
  getProductPricing,
  isProductInStock,
} from "@/utils/productDisplay";
import { colors } from "@/theme";

import {
  PDP_HEADER_BODY_HEIGHT,
  PDP_HEADER_COLLAPSE_END,
  PDP_HEADER_COLLAPSE_START,
  PDP_HORIZONTAL_PADDING,
} from "./productDetail.constants";

type Props = {
  scrollY: Animated.Value;
  headerCollapsed: boolean;
  product?: Product | null;
  cartBadgeCount?: number;
  onPressBack?: () => void;
  onPressOffers?: () => void;
  onPressSearch?: () => void;
  onPressCart?: () => void;
  onAddToCart?: () => void;
  onNotify?: () => void;
};

export const ProductDetailHeader = memo(function ProductDetailHeader({
  scrollY,
  headerCollapsed,
  product,
  cartBadgeCount = 0,
  onPressBack,
  onPressOffers,
  onPressSearch,
  onPressCart,
  onAddToCart,
  onNotify,
}: Props) {
  const insets = useSafeAreaInsets();
  const showBadge = cartBadgeCount > 0;
  const pricing = product ? getProductPricing(product) : null;
  const inStock = product ? isProductInStock(product) : true;

  const headerSurfaceOpacity = scrollY.interpolate({
    inputRange: [0, PDP_HEADER_COLLAPSE_END],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [PDP_HEADER_COLLAPSE_START, PDP_HEADER_COLLAPSE_END],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const collapsedOpacity = scrollY.interpolate({
    inputRange: [PDP_HEADER_COLLAPSE_START, PDP_HEADER_COLLAPSE_END],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: "transparent" }}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.surface,
            opacity: headerSurfaceOpacity,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      />

      <View style={{ height: PDP_HEADER_BODY_HEIGHT }} collapsable={false}>
        <Animated.View
          pointerEvents={headerCollapsed ? "none" : "box-none"}
          style={[StyleSheet.absoluteFill, { opacity: heroOpacity }]}
          className={`flex-row items-center justify-between ${PDP_HORIZONTAL_PADDING}`}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressBack}
            className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
          >
            <Feather
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>

          <View className="flex-row items-center">
            <HeaderIconButton
              accessibilityLabel="Offers"
              icon="percent"
              onPress={onPressOffers}
            />
            <HeaderIconButton
              accessibilityLabel="Search"
              icon="search"
              onPress={onPressSearch}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showBadge ? `Cart, ${cartBadgeCount} items` : "Cart"}
              hitSlop={HEADER_HIT_SLOP}
              onPress={onPressCart}
              className={`relative ${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
            >
              <Feather
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                name="shopping-cart"
                size={22}
                color={colors.textPrimary}
              />
              {showBadge ? (
                <View className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-pillfly-promo-red px-1 py-0.5">
                  <Text className="text-center text-[11px] font-bold text-white">
                    {formatCartBadgeCount(cartBadgeCount)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          pointerEvents={headerCollapsed ? "box-none" : "none"}
          style={[StyleSheet.absoluteFill, { opacity: collapsedOpacity }]}
          className={`flex-row items-center gap-2 ${PDP_HORIZONTAL_PADDING}`}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressBack}
            className={`${HEADER_ICON_SLOT_CLASS} shrink-0 items-center justify-center active:opacity-75`}
          >
            <Feather
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              name="arrow-left"
              size={22}
              color={colors.textPrimary}
            />
          </Pressable>

          <View className="min-w-0 flex-1">
            <Text className="text-[14px] font-bold text-pillfly-ink" numberOfLines={1}>
              {product?.title ?? ""}
            </Text>
            {pricing ? (
              <Text className="text-[13px] font-bold text-pillfly-ink">
                {formatInr(pricing.salePrice)}
              </Text>
            ) : null}
          </View>

          {product ? (
            <View className="shrink-0">
              {inStock ? (
                <PrimaryButton
                  label="Add"
                  size="sm"
                  accessibilityLabel={`Add ${product.title} to cart`}
                  onPress={onAddToCart}
                  className="min-w-[72px] rounded-xl px-3"
                />
              ) : (
                <OutlineButton
                  label="Notify"
                  size="sm"
                  accessibilityLabel={`Notify when ${product.title} is available`}
                  onPress={onNotify}
                  className="min-w-[72px] rounded-xl px-3"
                />
              )}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
});

ProductDetailHeader.displayName = "ProductDetailHeader";

const HeaderIconButton = memo(function HeaderIconButton({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: "percent" | "search";
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HEADER_HIT_SLOP}
      onPress={onPress}
      className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
    >
      <Feather
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        name={icon}
        size={22}
        color={colors.textPrimary}
      />
    </Pressable>
  );
});

HeaderIconButton.displayName = "HeaderIconButton";
