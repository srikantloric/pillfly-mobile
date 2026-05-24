import { StyleSheet } from 'react-native';

export const OFFER_CONTENT_PADDING = 16;

export const offerColors = {
  screenBg: '#F5F6FA',
  statusBar: '#FFFFFF',
  ribbonTeal: '#0D9488',
  infoStripBg: '#E8F4FC',
  infoStripText: '#1A3B5D',
  trustTitle: '#475569',
  trustSubtitle: '#1E3A5F',
  benefitBoxBg: '#EBF4FA',
  benefitMuted: '#64748B',
  perPersonRed: '#B22222',
  ctaButton: '#333333',
  trustStripBg: '#FFF9E6',
  trustBadgeTitle: '#1F2937',
  trustBadgeSubtitle: '#64748B',
  divider: '#E2E8F0',
  testCount: '#64748B',
  priceLabel: '#94A3B8',
  footerText: '#64748B',
} as const;

export const offerCardShadow = StyleSheet.create({
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
