import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather';
import { Octicons } from '@react-native-vector-icons/octicons';

import {
  HEADER_HIT_SLOP,
  HEADER_ICON_SLOT_CLASS,
  SEARCH_PLACEHOLDERS,
} from '@/components/header/appHeader.constants';
import { homeHeaderStyles } from '@/components/header/appHeader.styles';
import { formatCartBadgeCount } from '@/components/header/header.utils';
import { useSharedHeaderNavigation } from '@/components/header/useSharedHeaderNavigation';
import { colors } from '@/theme';

export function CategoriesHeader({
  navigation,
  cartBadgeCount = 0,
}: {
  navigation: NavigationProp<ParamListBase>;
  cartBadgeCount?: number;
}) {
  const insets = useSafeAreaInsets();
  const { onPressProfile, onPressSearch, onPressCart } = useSharedHeaderNavigation(navigation);
  const showBadge = cartBadgeCount > 0;
  const searchPlaceholder = SEARCH_PLACEHOLDERS.categories;

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.brandTeal }}>
      <View className="flex-row items-center gap-2 px-3 pb-3 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          hitSlop={HEADER_HIT_SLOP}
          onPress={onPressProfile}
          className={`${HEADER_ICON_SLOT_CLASS} shrink-0 items-center justify-center active:opacity-85`}
          style={homeHeaderStyles.iconButtonOnTeal}
        >
          <Octicons name="person" size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={searchPlaceholder}
          onPress={onPressSearch}
          className="min-h-11 min-w-0 flex-1 flex-row items-center rounded-xl bg-white/95 px-3 py-2.5 active:opacity-90"
        >
          <Feather name="search" size={20} color={colors.textSecondary} />
          <Text className="ml-2 flex-1 text-[15px] text-slate-500" numberOfLines={1}>
            {searchPlaceholder}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showBadge ? `Cart, ${cartBadgeCount} items` : 'Cart'}
          hitSlop={HEADER_HIT_SLOP}
          onPress={onPressCart}
          className={`relative ${HEADER_ICON_SLOT_CLASS} shrink-0 items-center justify-center active:opacity-85`}
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
  );
}
