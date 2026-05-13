import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather';
import { Octicons } from '@react-native-vector-icons/octicons';

import {
  APP_HEADER_VARIANT_ICON_COLOR,
  APP_HEADER_VARIANT_SURFACE,
  DEFAULT_SEARCH_PLACEHOLDER,
  HEADER_HIT_SLOP,
  HEADER_ICON_SLOT_CLASS,
} from './appHeader.constants';
import type { AppHeaderProps } from './appHeader.types';

function formatBadge(count: number): string {
  if (count > 99) {
    return '99+';
  }
  return String(count);
}

export function AppHeader({
  showProfile = false,
  showSearch = false,
  showCart = false,
  title,
  variant = 'home',
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  cartBadgeCount,
  onPressProfile,
  onPressSearch,
  onPressCart,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const surfaceClassName = APP_HEADER_VARIANT_SURFACE[variant];
  const iconColor = APP_HEADER_VARIANT_ICON_COLOR[variant];

  const centerContent = useMemo(() => {
    if (showSearch) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={searchPlaceholder}
          onPress={onPressSearch}
          className="flex-1 min-w-0 flex-row items-center rounded-xl bg-slate-100/90 px-3 py-2.5 active:opacity-90"
        >
          <Feather name="search" size={20} color={iconColor} />
          <Text className="ml-2 flex-1 text-[15px] text-slate-500" numberOfLines={1}>
            {searchPlaceholder}
          </Text>
        </Pressable>
      );
    }
    if (title) {
      return (
        <Text
          className="text-center text-[17px] font-semibold text-slate-900"
          numberOfLines={1}
        >
          {title}
        </Text>
      );
    }
    return <View className="flex-1" />;
  }, [showSearch, title, searchPlaceholder, onPressSearch, iconColor]);

  const showBadge = cartBadgeCount != null && cartBadgeCount > 0;

  return (
    <View className={surfaceClassName} style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <View className={`${HEADER_ICON_SLOT_CLASS} items-start justify-center`}>
          {showProfile ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              hitSlop={HEADER_HIT_SLOP}
              onPress={onPressProfile}
              className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center rounded-full active:bg-black/5`}
            >
              <Octicons name="person" size={24} color={iconColor} />
            </Pressable>
          ) : (
            <View className={HEADER_ICON_SLOT_CLASS} />
          )}
        </View>

        <View className="min-h-[44px] flex-1 justify-center px-1">{centerContent}</View>

        <View className={`${HEADER_ICON_SLOT_CLASS} items-end justify-center`}>
          {showCart ? (
            <HeaderCartButton
              badgeCount={showBadge ? cartBadgeCount : undefined}
              iconColor={iconColor}
              onPress={onPressCart}
            />
          ) : (
            <View className={HEADER_ICON_SLOT_CLASS} />
          )}
        </View>
      </View>
    </View>
  );
}

function HeaderCartButton({
  iconColor,
  onPress,
  badgeCount,
}: {
  iconColor: string;
  onPress?: () => void;
  badgeCount?: number;
}) {
  const label =
    badgeCount != null && badgeCount > 0 ? `Cart, ${badgeCount} items` : 'Cart';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HEADER_HIT_SLOP}
      onPress={onPress}
      className={`relative ${HEADER_ICON_SLOT_CLASS} items-center justify-center rounded-full active:bg-black/5`}
    >
      <Feather name="shopping-cart" size={24} color={iconColor} />
      {badgeCount != null && badgeCount > 0 ? (
        <View className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-red-600 px-1 py-0.5">
          <Text className="text-center text-[11px] font-bold text-white">
            {formatBadge(badgeCount)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
