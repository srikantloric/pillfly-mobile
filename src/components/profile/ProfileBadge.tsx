import React, { memo } from 'react';
import { Text, View } from 'react-native';

import type { ProfileMenuBadge } from './profile.types';
import { profileColors } from './profile.styles';

type Props = {
  badge: ProfileMenuBadge;
};

const toneStyles = {
  green: {
    backgroundColor: profileColors.badgeGreen,
    textColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  greenDark: {
    backgroundColor: profileColors.badgeGreenDark,
    textColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  yellow: {
    backgroundColor: profileColors.badgeYellow,
    textColor: profileColors.badgeYellowText,
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  red: {
    backgroundColor: profileColors.badgeRed,
    textColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 7,
    minWidth: 24,
  },
} as const;

export const ProfileBadge = memo(function ProfileBadge({ badge }: Props) {
  if (badge.kind === 'count') {
    const style = toneStyles.red;
    return (
      <View
        className="items-center justify-center py-0.5"
        style={{
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          paddingHorizontal: style.paddingHorizontal,
          minWidth: style.minWidth,
        }}
      >
        <Text
          className="text-[11px] font-bold"
          style={{ color: style.textColor }}
        >
          {badge.value}
        </Text>
      </View>
    );
  }

  const style = toneStyles[badge.tone];
  const isWallet = badge.tone === 'yellow';

  return (
    <View
      className="flex-row items-center py-0.5"
      style={{
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        paddingHorizontal: style.paddingHorizontal,
      }}
    >
      {isWallet ? (
        <Text className="mr-1 text-[12px]" style={{ color: profileColors.coin }}>
          ₹
        </Text>
      ) : null}
      <Text
        className="text-[11px] font-bold"
        style={{ color: style.textColor }}
      >
        {badge.label}
      </Text>
    </View>
  );
});

ProfileBadge.displayName = 'ProfileBadge';
