import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { AppStackParamList } from '../types/navigation.types';

export type SharedAppRoute = keyof Pick<AppStackParamList, 'Profile' | 'Search' | 'Cart'>;

type AppNavigation = NavigationProp<AppStackParamList>;

const APP_STACK_ROUTE_MARKERS = ['MainTabs', 'Cart', 'ProductDetail'] as const;

function isAppStackNavigation(navigation: NavigationProp<ParamListBase>): boolean {
  const routeNames = navigation.getState().routeNames;
  return APP_STACK_ROUTE_MARKERS.every((name) => routeNames.includes(name));
}

/** Walks up nested navigators until the App stack (Cart / ProductDetail live here). */
export function getAppStackNavigation(
  navigation: NavigationProp<ParamListBase>,
): AppNavigation {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    if (isAppStackNavigation(current)) {
      return current as unknown as AppNavigation;
    }
    current = current.getParent();
  }

  return navigation as unknown as AppNavigation;
}

export function navigateToSharedRoute(
  navigation: NavigationProp<ParamListBase>,
  route: SharedAppRoute,
  params?: AppStackParamList[SharedAppRoute],
) {
  const nav = getAppStackNavigation(navigation);

  if (params === undefined) {
    nav.navigate(route);
    return;
  }

  if (route === 'Profile') {
    nav.navigate('Profile', params as AppStackParamList['Profile']);
    return;
  }
  if (route === 'Search') {
    nav.navigate('Search', params as AppStackParamList['Search']);
    return;
  }
  nav.navigate('Cart', params as AppStackParamList['Cart']);
}
