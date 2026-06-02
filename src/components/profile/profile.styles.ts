import { StyleSheet } from 'react-native';

import { colors } from '../../theme';

export const PROFILE_CONTENT_PADDING = 16;

export const profileColors = {
  screenBg: colors.background,
  statusBar: colors.surface,
  headerIcon: colors.textPrimary,
  editAction: colors.primary,
  chevron: '#0D9488',
  divider: '#EEEEEE',
  menuIconTeal: '#0D9488',
  menuIconGreen: '#16A34A',
  menuIconPink: '#DB2777',
  badgeGreen: '#0D9488',
  badgeGreenDark: '#0F5C4F',
  badgeRed: '#DC2626',
  badgeYellow: '#FACC15',
  badgeYellowText: '#1F2937',
  corporateBg: '#F1F5F9',
  corporateBorder: '#E2E8F0',
  corporateTitle: '#334155',
  corporateSubtitle: '#94A3B8',
  logout: '#94A3B8',
  version: '#CBD5E1',
  coin: '#EAB308',
  plusGold: '#FACC15',
  plusPurpleStart: '#7C3AED',
  plusPurpleEnd: '#5B21B6',
} as const;

export const profileCardShadow = StyleSheet.create({
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
