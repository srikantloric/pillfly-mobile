import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../types/navigation.types';
import { CartScreen } from '@/features/cart';
import { CheckoutScreen } from '../../screens/cart';

const Stack = createNativeStackNavigator<CartStackParamList>();

export function CartStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout' }} />
    </Stack.Navigator>
  );
}
