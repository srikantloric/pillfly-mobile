import { StyleSheet } from 'react-native';

import { HEADER_ICON_BUTTON_RADIUS } from './appHeader.constants';

export const HEADER_HAIRLINE_WIDTH = StyleSheet.hairlineWidth;

export const homeHeaderStyles = StyleSheet.create({
  iconButtonOnTeal: {
    borderRadius: HEADER_ICON_BUTTON_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  iconButtonOnSurface: {
    borderRadius: HEADER_ICON_BUTTON_RADIUS,
  },
  topRowClip: {
    overflow: 'hidden',
  },
  searchBarAndroid: {
    elevation: 2,
  },
  cartRevealClip: {
    overflow: 'hidden',
  },
  savingsTitleClip: {
    overflow: 'hidden',
  },
  savingsIconRow: {
    zIndex: 2,
  },
});
