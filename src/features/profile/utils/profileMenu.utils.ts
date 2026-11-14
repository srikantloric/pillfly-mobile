import {
  PROFILE_MENU_ENTRIES,
  PROFILE_MENU_VISIBLE_IDS,
} from '../components/profile.constants';
import type {
  ProfileMenuBadge,
  ProfileMenuBadgeConfig,
  ProfileMenuDynamicBadges,
  ProfileMenuEntry,
} from '../types/profile.types';

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
  const visible = new Set<string>(PROFILE_MENU_VISIBLE_IDS);

  return PROFILE_MENU_ENTRIES.filter((entry) => visible.has(entry.id)).map(
    (entry): ProfileMenuEntry => {
      const { id, title, icon, badge: badgeConfig } = entry;

      if (!badgeConfig) {
        return { id, title, icon };
      }

      const badge = resolveBadge(badgeConfig, dynamicBadges);
      return badge ? { id, title, icon, badge } : { id, title, icon };
    },
  );
}
