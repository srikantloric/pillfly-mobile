import { StyleSheet } from 'react-native';

import { HOME_CONTENT_PADDING_HORIZONTAL } from '../../components/home/HomePromoBanner';

export const homeScreenStyles = StyleSheet.create({
  scrollContentGutter: {
    paddingHorizontal: HOME_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  horizontalMiniServices: {
    paddingHorizontal: 4,
    gap: 12,
  },
});
