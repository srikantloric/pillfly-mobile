import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation.types';
import { MainTabNavigator } from './MainTabNavigator';
import { ProfileStackNavigator } from './stacks/ProfileStackNavigator';
import { SearchStackNavigator } from './stacks/SearchStackNavigator';
import { CartStackNavigator } from './stacks/CartStackNavigator';
import { ProductDetailScreen } from '../screens/product';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Profile" component={ProfileStackNavigator} />
      <Stack.Screen name="Search" component={SearchStackNavigator} />
      <Stack.Screen name="Cart" component={CartStackNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
