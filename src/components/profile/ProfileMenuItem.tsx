import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import type { ProfileMenuBadge, ProfileMenuIcon } from './profile.types';
import { ProfileBadge } from './ProfileBadge';
import { profileColors } from './profile.styles';

type Props = {
  title: string;
  icon: ProfileMenuIcon;
  badge?: ProfileMenuBadge;
  showDivider?: boolean;
  onPress?: () => void;
};

function MenuIcon({ icon }: { icon: ProfileMenuIcon }) {
  const size = 22;
  switch (icon.family) {
    case 'material':
      return <MaterialIcons name={icon.name} size={size} color={icon.color} />;
    case 'ionicons':
      return <Ionicons name={icon.name} size={size} color={icon.color} />;
    default:
      return <Feather name={icon.name} size={size} color={icon.color} />;
  }
}

export const ProfileMenuItem = memo(function ProfileMenuItem({
  title,
  icon,
  badge,
  showDivider = true,
  onPress,
}: Props) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        className="min-h-[52px] flex-row items-center px-4 active:opacity-75"
      >
        <View className="mr-3.5 h-7 w-7 items-center justify-center">
          <MenuIcon icon={icon} />
        </View>

        <Text className="flex-1 text-[15px] font-medium text-pillfly-ink">{title}</Text>

        {badge ? (
          <View className="mr-2">
            <ProfileBadge badge={badge} />
          </View>
        ) : null}

        <Feather name="chevron-right" size={20} color={profileColors.chevron} />
      </Pressable>
      {showDivider ? (
        <View
          className="ml-[52px] mr-4"
          style={{ height: 1, backgroundColor: profileColors.divider }}
        />
      ) : null}
    </>
  );
});

ProfileMenuItem.displayName = 'ProfileMenuItem';
