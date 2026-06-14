import type { ProfileMenuDynamicBadges } from '../components/profile/profile.types';

export type MockProfileUser = {
  phone: string;
  totalSavings: number;
  cartCount: number;
  dynamicMenuBadges: ProfileMenuDynamicBadges;
};

export const MOCK_PROFILE_USER: MockProfileUser = {
  phone: '1093456321',
  totalSavings: 36,
  cartCount: 0,
  dynamicMenuBadges: {
    notifications: 20,
  },
};
