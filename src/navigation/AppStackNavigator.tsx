import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProductDetailScreen } from '@/features/product';
import type { AppStackParamList } from '../types/navigation.types';
import { MainTabNavigator } from './MainTabNavigator';
import { CartStackNavigator } from './stacks/CartStackNavigator';
import { SearchStackNavigator } from './stacks/SearchStackNavigator';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Search" component={SearchStackNavigator} />
      <Stack.Screen name="Cart" component={CartStackNavigator} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ animation: 'fade', animationDuration: 250 }}
      />
    </Stack.Navigator>
  );
}
