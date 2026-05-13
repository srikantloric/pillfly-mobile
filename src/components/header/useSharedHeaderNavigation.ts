import { useMemo } from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { navigateToSharedRoute } from '../../navigation/navigateShared';

import type { SharedHeaderNavHandlers } from './appHeader.types';

export function useSharedHeaderNavigation(
  navigation: NavigationProp<ParamListBase>,
): Required<SharedHeaderNavHandlers> {
  return useMemo(
    () => ({
      onPressProfile: () => navigateToSharedRoute(navigation, 'Profile'),
      onPressSearch: () => navigateToSharedRoute(navigation, 'Search'),
      onPressCart: () => navigateToSharedRoute(navigation, 'Cart'),
    }),
    [navigation],
  );
}
