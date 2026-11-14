import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  LoginScreen: undefined;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  AddressForm: { addressId?: string } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Medicines: undefined;
  Orders: NavigatorScreenParams<OrdersStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type SearchStackParamList = {
  SearchHome: undefined;
  SearchResults: { query: string; categoryId?: string };
};

export type CartStackParamList = {
  CartMain: undefined;
  AddressForm: { addressId?: string } | undefined;
  Checkout: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Search: NavigatorScreenParams<SearchStackParamList> | undefined;
  Cart: NavigatorScreenParams<CartStackParamList> | undefined;
  ProductDetail: { productId: string };
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
