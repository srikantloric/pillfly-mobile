import React, { memo } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import { Octicons } from '@react-native-vector-icons/octicons';

import { useSavingsHeaderAnimations } from './useSavingsHeaderAnimations';
import { savingsColors, savingsHeaderStyles } from '../savings/savings.styles';

import { HEADER_HIT_SLOP } from './appHeader.constants';
import { homeHeaderStyles } from './appHeader.styles';
import type { SavingsHeaderProps } from './appHeader.types';
import { formatCartBadgeCount } from './header.utils';
import { useSharedHeaderNavigation } from './useSharedHeaderNavigation';

export const SavingsHeader = memo(function SavingsHeader({
  scrollY,
  insets,
  navigation,
  cartBadgeCount = 0,
}: SavingsHeaderProps) {
  const { onPressProfile, onPressSearch, onPressCart } = useSharedHeaderNavigation(navigation);
  const showBadge = cartBadgeCount > 0;
  const animations = useSavingsHeaderAnimations(scrollY);

  return (
    <Animated.View
      style={{
        paddingTop: insets.top,
        paddingBottom: animations.headerPaddingBottom,
        backgroundColor: savingsColors.headerGreen,
        borderBottomLeftRadius: animations.bottomCornerRadius,
        borderBottomRightRadius: animations.bottomCornerRadius,
        overflow: 'hidden',
      }}
    >
      <View
        style={[
          homeHeaderStyles.savingsIconRow,
          { backgroundColor: savingsColors.headerGreen },
        ]}
        className="flex-row items-center justify-between px-4 pb-2 pt-1"
      >
        <HeaderIconButton
          accessibilityLabel="Profile"
          onPress={onPressProfile}
          icon={<Octicons name="person" size={22} color="#FFFFFF" />}
        />

        <View className="flex-row items-center gap-2">
          <HeaderIconButton
            accessibilityLabel="Search savings"
            onPress={onPressSearch}
            icon={<Feather name="search" size={22} color="#FFFFFF" />}
          />
          <HeaderIconButton
            accessibilityLabel={
              showBadge ? `Cart, ${cartBadgeCount} items` : 'Cart'
            }
            onPress={onPressCart}
            icon={<Feather name="shopping-cart" size={22} color="#FFFFFF" />}
            badge={showBadge ? cartBadgeCount : undefined}
          />
        </View>
      </View>

      <Animated.View
        accessibilityRole="header"
        style={[
          homeHeaderStyles.savingsTitleClip,
          {
            opacity: animations.titleOpacity,
            maxHeight: animations.titleMaxHeight,
            transform: [{ translateY: animations.titleTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <View className="items-center px-6 pt-1">
          <Text style={savingsHeaderStyles.title}>Savings</Text>
          <Text style={[savingsHeaderStyles.subtitle, savingsHeaderStyles.subtitleSpacing]}>
            One stop for all medicine and test savings
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
});

SavingsHeader.displayName = 'SavingsHeader';

const HeaderIconButton = memo(function HeaderIconButton({
  icon,
  onPress,
  accessibilityLabel,
  badge,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  badge?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HEADER_HIT_SLOP}
      onPress={onPress}
      className="relative h-11 w-11 items-center justify-center active:opacity-85"
      style={savingsHeaderStyles.iconButton}
    >
      {icon}
      {badge != null && badge > 0 ? (
        <View className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-red-600 px-1 py-0.5">
          <Text className="text-center text-[11px] font-bold text-white">
            {formatCartBadgeCount(badge)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
});

HeaderIconButton.displayName = 'SavingsHeaderIconButton';
