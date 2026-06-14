import { PROFILE_MENU_ENTRIES } from '../components/profile/profile.constants';
import type {
  ProfileMenuBadge,
  ProfileMenuBadgeConfig,
  ProfileMenuDynamicBadges,
  ProfileMenuEntry,
} from '../components/profile/profile.types';

function resolveBadge(
  badge: ProfileMenuBadgeConfig,
  dynamicBadges: ProfileMenuDynamicBadges,
): ProfileMenuBadge | undefined {
  if (badge.kind === 'pill') {
    return badge;
  }

  const value = dynamicBadges[badge.source];
  if (value == null || value <= 0) {
    return undefined;
  }

  return { kind: 'count', value };
}

export function resolveProfileMenuEntries(
  dynamicBadges: ProfileMenuDynamicBadges = {},
): ProfileMenuEntry[] {
  return PROFILE_MENU_ENTRIES.map((entry): ProfileMenuEntry => {
    const { id, title, icon, badge: badgeConfig } = entry;

    if (!badgeConfig) {
      return { id, title, icon };
    }

    const badge = resolveBadge(badgeConfig, dynamicBadges);
    return badge ? { id, title, icon, badge } : { id, title, icon };
  });
}
