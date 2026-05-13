import React from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { SEARCH_PLACEHOLDERS } from './appHeader.constants';
import { AppHeader } from './AppHeader';
import { useSharedHeaderNavigation } from './useSharedHeaderNavigation';

export function SavingsHeader({
  navigation,
  cartBadgeCount,
}: {
  navigation: NavigationProp<ParamListBase>;
  cartBadgeCount?: number;
}) {
  const handlers = useSharedHeaderNavigation(navigation);

  return (
    <AppHeader
      variant="savings"
      showSearch
      showCart
      searchPlaceholder={SEARCH_PLACEHOLDERS.savings}
      cartBadgeCount={cartBadgeCount}
      {...handlers}
    />
  );
}
