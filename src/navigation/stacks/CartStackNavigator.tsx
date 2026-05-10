import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../types/navigation.types';
import { CartScreen, CheckoutScreen } from '../../screens/cart';

const Stack = createNativeStackNavigator<CartStackParamList>();

export function CartStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}
