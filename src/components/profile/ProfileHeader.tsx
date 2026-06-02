import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather';

import {
  HEADER_HIT_SLOP,
  HEADER_ICON_SLOT_CLASS,
} from '../header/appHeader.constants';
import { formatCartBadgeCount } from '../header/header.utils';
import { profileColors } from './profile.styles';

type Props = {
  title?: string;
  cartBadgeCount?: number;
  onPressBack?: () => void;
  onPressSearch?: () => void;
  onPressCart?: () => void;
};

export const ProfileHeader = memo(function ProfileHeader({
  title = 'Profile',
  cartBadgeCount = 0,
  onPressBack,
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
      <View className="flex-row items-center px-3 pb-2.5 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={HEADER_HIT_SLOP}
          onPress={onPressBack}
          className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
        >
          <Feather name="arrow-left" size={24} color={profileColors.headerIcon} />
        </Pressable>

        <Text
          className="flex-1 text-center text-[17px] font-bold text-pillfly-ink"
          numberOfLines={1}
        >
          {title}
        </Text>

        <View className="flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressSearch}
            className={`${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
          >
            <Feather name="search" size={22} color={profileColors.headerIcon} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showBadge ? `Cart, ${cartBadgeCount} items` : 'Cart'}
            hitSlop={HEADER_HIT_SLOP}
            onPress={onPressCart}
            className={`relative ${HEADER_ICON_SLOT_CLASS} items-center justify-center active:opacity-75`}
          >
            <Feather name="shopping-cart" size={22} color={profileColors.headerIcon} />
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

ProfileHeader.displayName = 'ProfileHeader';
