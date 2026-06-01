import { StyleSheet } from 'react-native';

import { HEADER_ICON_BUTTON_RADIUS } from '../header/appHeader.constants';

export const SAVINGS_CONTENT_PADDING = 16;

export const savingsColors = {
  headerGreen: '#106853',
  headerGreenDark: '#0D5C4F',
  titleGold: '#F5C842',
  membershipPurpleStart: '#6A4BC1',
  membershipPurpleEnd: '#5B3DA8',
  couponSectionBg: '#ECEFF3',
  chipActiveBg: '#E8F5F0',
  chipActiveBorder: '#106853',
  subscriptionBg: '#FFF3D6',
  copyCode: '#106853',
  valueGreen: '#0D9488',
  chipBorder: '#D1D5DB',
  chipText: '#475569',
  dividerStroke: '#CBD5E1',
  chevron: '#94A3B8',
} as const;

export const savingsCardShadow = StyleSheet.create({
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});

export const savingsHeaderStyles = StyleSheet.create({
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: HEADER_ICON_BUTTON_RADIUS,
  },
  title: {
    color: savingsColors.titleGold,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  subtitleSpacing: {
    marginTop: 6,
    paddingHorizontal: 8,
  },
});

export const couponDividerStyles = StyleSheet.create({
  notch: {
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    marginTop: -8,
    borderRadius: 8,
    backgroundColor: savingsColors.couponSectionBg,
  },
  notchLeft: {
    left: -8,
  },
  notchRight: {
    right: -8,
  },
});
