import { useMemo } from 'react';
import { Animated } from 'react-native';

import { SAVINGS_HEADER_SCROLL } from './appHeader.constants';

export function useSavingsHeaderAnimations(scrollY: Animated.Value) {
  return useMemo(() => {
    const { collapseStart, collapseEnd, titleExpandedHeight, bottomRadiusExpanded } =
      SAVINGS_HEADER_SCROLL;

    return {
      titleOpacity: scrollY.interpolate({
        inputRange: [0, 40, collapseEnd],
        outputRange: [1, 0.4, 0],
        extrapolate: 'clamp',
      }),
      titleMaxHeight: scrollY.interpolate({
        inputRange: [collapseStart, collapseEnd],
        outputRange: [titleExpandedHeight, 0],
        extrapolate: 'clamp',
      }),
      titleTranslateY: scrollY.interpolate({
        inputRange: [collapseStart, collapseEnd],
        outputRange: [0, -28],
        extrapolate: 'clamp',
      }),
      headerPaddingBottom: scrollY.interpolate({
        inputRange: [collapseStart, collapseEnd],
        outputRange: [24, 10],
        extrapolate: 'clamp',
      }),
      bottomCornerRadius: scrollY.interpolate({
        inputRange: [collapseStart, collapseEnd],
        outputRange: [bottomRadiusExpanded, 0],
        extrapolate: 'clamp',
      }),
    };
  }, [scrollY]);
}
