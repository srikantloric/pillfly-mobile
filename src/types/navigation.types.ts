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

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
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
