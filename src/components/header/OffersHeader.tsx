import React from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { AppHeader } from './AppHeader';
import { useSharedHeaderNavigation } from './useSharedHeaderNavigation';

export function OffersHeader({
  navigation,
  cartBadgeCount,
}: {
  navigation: NavigationProp<ParamListBase>;
  cartBadgeCount?: number;
}) {
  const { onPressProfile, onPressCart } = useSharedHeaderNavigation(navigation);

  return (
    <AppHeader
      variant="offer"
      showProfile
      showCart
      title="Offers"
      cartBadgeCount={cartBadgeCount}
      onPressProfile={onPressProfile}
      onPressCart={onPressCart}
    />
  );
}
