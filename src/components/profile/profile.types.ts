import type { ComponentProps } from 'react';
import type { Feather } from '@react-native-vector-icons/feather';
import type { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { Ionicons } from '@react-native-vector-icons/ionicons';

export type ProfileMenuIcon =
  | { family: 'feather'; name: ComponentProps<typeof Feather>['name']; color: string }
  | { family: 'material'; name: ComponentProps<typeof MaterialIcons>['name']; color: string }
  | { family: 'ionicons'; name: ComponentProps<typeof Ionicons>['name']; color: string };

export type ProfileMenuPillTone = 'green' | 'greenDark' | 'yellow' | 'red';

export type ProfileMenuBadge =
  | { kind: 'pill'; label: string; tone: ProfileMenuPillTone }
  | { kind: 'count'; value: number };

/** Keys for menu badges whose values come from user/session state (API, store, mocks). */
export type ProfileMenuBadgeSource = 'notifications';

export type ProfileMenuBadgeConfig =
  | { kind: 'pill'; label: string; tone: ProfileMenuPillTone }
  | { kind: 'count'; source: ProfileMenuBadgeSource };

export type ProfileMenuDynamicBadges = Partial<
  Record<ProfileMenuBadgeSource, number>
>;

export type ProfileMenuEntryConfig = {
  id: string;
  title: string;
  icon: ProfileMenuIcon;
  badge?: ProfileMenuBadgeConfig;
};

export type ProfileMenuEntry = {
  id: string;
  title: string;
  icon: ProfileMenuIcon;
  badge?: ProfileMenuBadge;
};
