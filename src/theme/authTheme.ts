/** Login / auth screen design tokens — keep in sync with tailwind `pillfly-auth` colors */

export const authColors = {
  primaryGreen: '#0B9444',
  lightGreen: '#8EDB92',
  softBackgroundGreen: '#EAF8EC',
  textDark: '#1F2937',
  mutedText: '#6B7280',
  gradientStart: '#76C859',
  gradientEnd: '#0B9444',
  white: '#FFFFFF',
  inputBorder: '#8EDB92',
  dividerMuted: '#D1D5DB',
  decorativeOpacity: 0.35,
} as const;

export const authSpacing = {
  screenHorizontal: 24,
  screenTop: 8,
  logoSize: 56,
  brandTop: 8,
  subtitleTop: 4,
  heroTop: 12,
  heroBottom: 8,
  sectionVertical: 20,
  inputHeight: 70,
  buttonHeight: 64,
  footerTop: 24,
  footerBottom: 16,
  badgeOverlap: 28,
} as const;

export const authTypography = {
  skip: 15,
  brand: 28,
  subtitle: 14,
  dividerTitle: 16,
  countryCode: 17,
  input: 16,
  button: 17,
  badge: 13,
  footer: 12,
  footerLinks: 13,
} as const;

export const authRadii = {
  input: 22,
  button: 20,
  badge: 999,
  glow: 999,
} as const;
