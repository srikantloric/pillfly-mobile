import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HEADER_HIT_SLOP, HEADER_ICON_SLOT_CLASS } from "@/components/header/appHeader.constants";
import { homeHeaderStyles } from "@/components/header/appHeader.styles";
import { formatCartBadgeCount } from "@/components/header/header.utils";
import { colors } from "@/theme";

type Props = {
  title: string;
  cartBadgeCount?: number;
  onPressBack?: () => void;
  onPressSearch?: () => void;
  onPressCart?: () => void;
};

export const StoreProductsHeader = memo(function StoreProductsHeader({
  title,
  cartBadgeCount = 0,
  onPressBack,
  onPressSearch,
  onPressCart,
}: Props) {
  const insets = useSafeAreaInsets();
  const showBadge = cartBadgeCount > 0;

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.brandTeal }}>
      <View className="flex-row items-center px-3 pb-2.5 pt-1">
        {onPressBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressBack}
            className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-85`}
            style={homeHeaderStyles.iconButtonOnTeal}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
        ) : null}

        <Text
          className={`min-w-0 flex-1 text-[18px] font-bold text-white ${onPressBack ? "ml-3" : "ml-1"}`}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressSearch}
            className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-85`}
            style={homeHeaderStyles.iconButtonOnTeal}
          >
            <Feather name="search" size={22} color="#FFFFFF" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showBadge ? `Cart, ${cartBadgeCount} items` : "Cart"}
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressCart}
            className={`relative ${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-85`}
            style={homeHeaderStyles.iconButtonOnTeal}
          >
            <Feather name="shopping-cart" size={22} color="#FFFFFF" />
            {showBadge ? (
              <View className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-pillfly-promo-red px-1 py-0.5">
                <Text className="text-center text-[10px] font-bold text-white">
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

StoreProductsHeader.displayName = "StoreProductsHeader";
