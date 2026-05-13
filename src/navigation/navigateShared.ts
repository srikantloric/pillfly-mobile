import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { AppStackParamList } from '../types/navigation.types';

export type SharedAppRoute = keyof Pick<AppStackParamList, 'Profile' | 'Search' | 'Cart'>;

type AppNavigation = NavigationProp<AppStackParamList>;

export function navigateToSharedRoute(
  navigation: NavigationProp<ParamListBase>,
  route: SharedAppRoute,
  params?: AppStackParamList[SharedAppRoute],
) {
  const nav = navigation as unknown as AppNavigation;

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
