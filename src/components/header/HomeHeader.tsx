import React, { useCallback } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';

import { navigateToSharedRoute } from '../../navigation/navigateShared';
import { colors } from '../../theme';

import { HEADER_HIT_SLOP, HOME_HEADER_SCROLL } from './appHeader.constants';
import { HEADER_HAIRLINE_WIDTH, homeHeaderStyles } from './appHeader.styles';
import type { HomeHeaderProps } from './appHeader.types';

// Scroll-linked home chrome; other tabs use AppHeader (no shared scroll state).
export function HomeHeader({
  scrollY,
  insets,
  navigation,
  cartBadgeCount = 0,
}: HomeHeaderProps) {
  const go = useCallback(
    (route: 'Profile' | 'Search' | 'Cart') => {
      navigateToSharedRoute(navigation, route);
    },
    [navigation],
  );

  const headerBg = scrollY.interpolate({
    inputRange: [HOME_HEADER_SCROLL.collapseStart, HOME_HEADER_SCROLL.collapseEnd],
    outputRange: [colors.brandTeal, colors.surface],
    extrapolate: 'clamp',
  });

  const topRowOpacity = scrollY.interpolate({
    inputRange: [0, 44],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const topRowHeight = scrollY.interpolate({
    inputRange: [0, 52],
    outputRange: [56, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        paddingTop: insets.top,
        backgroundColor: headerBg,
        borderBottomWidth: HEADER_HAIRLINE_WIDTH,
        borderBottomColor: colors.border,
      }}
    >
      <View>
        <Animated.View
          style={[
            homeHeaderStyles.topRowClip,
            {
              opacity: topRowOpacity,
              maxHeight: topRowHeight,
            },
          ]}
          className="flex-row items-center gap-3 px-4 pt-1"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            hitSlop={HEADER_HIT_SLOP}
            onPress={() => go('Profile')}
            className="h-11 w-11 shrink-0 items-center justify-center active:opacity-85"
            style={homeHeaderStyles.iconButtonOnTeal}
          >
            <Feather name="user" size={22} color="#FFFFFF" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityHint="Coming soon"
            onPress={() => {}}
            className="min-h-11 min-w-0 flex-1 flex-row items-center justify-center px-1 active:opacity-80"
          >
            <Feather name="map-pin" size={16} color="#FFFFFF" />
            <View className="ml-1.5 flex-1">
              <Text className="text-[13px] font-bold text-white">4 Hours Delivery</Text>
              <View className="mt-0.5 flex-row items-center">
                <Text className="text-[12px] text-white/90" numberOfLines={1}>
                  Mumbai, 400001
                </Text>
                <Feather name="chevron-right" size={16} color="#FFFFFF" />
              </View>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cart"
            hitSlop={HEADER_HIT_SLOP}
            onPress={() => go('Cart')}
            className="relative h-11 w-11 shrink-0 items-center justify-center active:opacity-85"
            style={homeHeaderStyles.iconButtonOnTeal}
          >
            <Feather name="shopping-cart" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
          <Animated.View
            className="min-h-[46px] min-w-0 flex-1 flex-row items-center rounded-2xl bg-white px-3 shadow-sm"
            style={homeHeaderStyles.searchBarAndroid}
          >
            <Pressable
              accessibilityRole="button"
              className="flex-1 flex-row items-center py-2.5 active:opacity-80"
              onPress={() => go('Search')}
            >
              <Feather name="search" size={20} color={colors.textSecondary} />
              <Text className="ml-2 flex-1 text-[15px] text-pillfly-muted" numberOfLines={1}>
                Search for Medicines/Lab Test...
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search with camera"
              hitSlop={HEADER_HIT_SLOP}
              onPress={() => go('Search')}
              className="p-1 active:opacity-70"
            >
              <Feather name="camera" size={22} color={colors.textSecondary} />
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[
              homeHeaderStyles.cartRevealClip,
              {
                opacity: scrollY.interpolate({
                  inputRange: [24, 64],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
                width: scrollY.interpolate({
                  inputRange: [24, 64],
                  outputRange: [0, 44],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Cart, ${cartBadgeCount} items`}
              hitSlop={HEADER_HIT_SLOP}
              onPress={() => go('Cart')}
              className="relative h-11 w-11 shrink-0 items-center justify-center active:bg-slate-100"
              style={homeHeaderStyles.iconButtonOnSurface}
            >
              <Feather name="shopping-cart" size={24} color={colors.textPrimary} />
              {cartBadgeCount > 0 ? (
                <View className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-emerald-600 px-1 py-0.5">
                  <Text className="text-center text-[10px] font-bold text-white">
                    {cartBadgeCount > 99 ? '99+' : String(cartBadgeCount)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}
