import React, { memo, useCallback, useMemo } from 'react';
import { Alert, View } from 'react-native';

import { resolveProfileMenuEntries } from '../../utils/profileMenu.utils';
import { profileCardShadow } from './profile.styles';
import { ProfileMenuItem } from './ProfileMenuItem';
import type { ProfileMenuDynamicBadges, ProfileMenuEntry } from './profile.types';

type Props = {
  dynamicBadges?: ProfileMenuDynamicBadges;
};

export const ProfileMenuList = memo(function ProfileMenuList({ dynamicBadges }: Props) {
  const menuEntries = useMemo(
    () => resolveProfileMenuEntries(dynamicBadges),
    [dynamicBadges],
  );

  const onPressEntry = useCallback((entry: ProfileMenuEntry) => {
    Alert.alert(entry.title, 'This section will be available soon.');
  }, []);

  return (
    <View
      className="mt-3 overflow-hidden rounded-2xl border border-pillfly-line bg-pillfly-surface"
      style={profileCardShadow.card}
    >
      {menuEntries.map((entry, index) => {
        const isLastItem = index === menuEntries.length - 1;

        return (
          <ProfileMenuItem
            key={entry.id}
            title={entry.title}
            icon={entry.icon}
            badge={entry.badge}
            showDivider={!isLastItem}
            onPress={() => onPressEntry(entry)}
          />
        );
      })}
    </View>
  );
});

ProfileMenuList.displayName = 'ProfileMenuList';
