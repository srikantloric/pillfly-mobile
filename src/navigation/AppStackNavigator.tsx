import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation.types';
import { MainTabNavigator } from './MainTabNavigator';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CartScreen } from '../screens/cart/CartScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Profile' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: true, title: 'Search' }}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: 'Cart' }} />
    </Stack.Navigator>
  );
}
