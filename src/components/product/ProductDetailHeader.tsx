import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import {
  HEADER_HIT_SLOP,
  HEADER_ICON_SLOT_CLASS,
} from "@/components/header/appHeader.constants";
import { formatCartBadgeCount } from "@/components/header/header.utils";
import { colors } from "@/theme";

type Props = {
  cartBadgeCount?: number;
  onPressBack?: () => void;
  onPressOffers?: () => void;
  onPressSearch?: () => void;
  onPressCart?: () => void;
};

export const ProductDetailHeader = memo(function ProductDetailHeader({
  cartBadgeCount = 0,
  onPressBack,
  onPressOffers,
  onPressSearch,
  onPressCart,
}: Props) {
  const insets = useSafeAreaInsets();
  const showBadge = cartBadgeCount > 0;

  return (
    <View
      className="border-b border-pillfly-line bg-pillfly-surface"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-2 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={HEADER_HIT_SLOP}
          onPress={onPressBack}
          className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>

        <View className="flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Offers"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressOffers}
            className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
          >
            <Feather name="percent" size={22} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressSearch}
            className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
          >
            <Feather name="search" size={22} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showBadge ? `Cart, ${cartBadgeCount} items` : "Cart"}
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressCart}
            className={`relative ${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
          >
            <Feather name="shopping-cart" size={22} color={colors.textPrimary} />
            {showBadge ? (
              <View className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-red-600 px-1 py-0.5">
                <Text className="text-center text-[11px] font-bold text-white">
                  {formatCartBadgeCount(cartBadgeCount)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
});

ProductDetailHeader.displayName = "ProductDetailHeader";
