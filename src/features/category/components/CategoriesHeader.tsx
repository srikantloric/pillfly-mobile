import React from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { SEARCH_PLACEHOLDERS } from '@/components/header/appHeader.constants';
import { AppHeader } from '@/components/header/AppHeader';
import { useSharedHeaderNavigation } from '@/components/header/useSharedHeaderNavigation';

export function CategoriesHeader({
  navigation,
  cartBadgeCount,
}: {
  navigation: NavigationProp<ParamListBase>;
  cartBadgeCount?: number;
}) {
  const handlers = useSharedHeaderNavigation(navigation);

  return (
    <AppHeader
      variant="category"
      showProfile
      showSearch
      showCart
      searchPlaceholder={SEARCH_PLACEHOLDERS.categories}
      cartBadgeCount={cartBadgeCount}
      {...handlers}
    />
  );
}
