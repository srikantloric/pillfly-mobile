import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  AuthSignIn: undefined;
  AuthSignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Offer: undefined;
  Savings: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type SearchStackParamList = {
  SearchHome: undefined;
  SearchResults: { query: string };
};

export type CartStackParamList = {
  CartMain: undefined;
  Checkout: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
  Search: NavigatorScreenParams<SearchStackParamList> | undefined;
  Cart: NavigatorScreenParams<CartStackParamList> | undefined;
};

export type RootStackParamList = {
  Authentication: NavigatorScreenParams<AuthStackParamList> | undefined;
  Application: NavigatorScreenParams<AppStackParamList> | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
