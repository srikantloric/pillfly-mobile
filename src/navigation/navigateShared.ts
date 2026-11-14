import { CommonActions, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import type { AppStackParamList, MainTabParamList, OrdersStackParamList } from '../types/navigation.types';

export type SharedAppRoute = keyof Pick<AppStackParamList, 'Search' | 'Cart'> | 'Profile';

type AppNavigation = NavigationProp<AppStackParamList>;

const APP_STACK_ROUTE_MARKERS = ['MainTabs', 'Cart', 'ProductDetail'] as const;

function isAppStackNavigation(navigation: NavigationProp<ParamListBase>): boolean {
  const routeNames = navigation.getState().routeNames;
  return APP_STACK_ROUTE_MARKERS.every((name) => routeNames.includes(name));
}

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
  params?: AppStackParamList['Search'] | AppStackParamList['Cart'] | MainTabParamList['Profile'],
) {
  const nav = getAppStackNavigation(navigation);

  if (route === 'Profile') {
    if (params === undefined) {
      nav.navigate('MainTabs', { screen: 'Profile' });
      return;
    }
    nav.navigate('MainTabs', {
      screen: 'Profile',
      params: params as MainTabParamList['Profile'],
    });
    return;
  }

  if (params === undefined) {
    nav.navigate(route);
    return;
  }

  if (route === 'Search') {
    nav.navigate('Search', params as AppStackParamList['Search']);
    return;
  }

  nav.navigate('Cart', params as AppStackParamList['Cart']);
}

function ordersStackState(routes: { name: keyof OrdersStackParamList; params?: object }[]) {
  return {
    routes,
    index: routes.length - 1,
  };
}

export function navigateToOrdersTab(
  navigation: NavigationProp<ParamListBase>,
  params?: MainTabParamList['Orders'],
) {
  const nav = getAppStackNavigation(navigation);

  if (params == null || params.screen === 'OrdersList' || params.screen == null) {
    nav.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'Orders',
          params: {
            state: ordersStackState([{ name: 'OrdersList' }]),
          },
        },
      }),
    );
    return;
  }

  if (params.screen === 'OrderDetail') {
    nav.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'Orders',
          params: {
            state: ordersStackState([
              { name: 'OrdersList' },
              { name: 'OrderDetail', params: params.params },
            ]),
          },
        },
      }),
    );
  }
}
