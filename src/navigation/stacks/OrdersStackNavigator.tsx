import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { OrderDetailScreen } from '@/features/order/screens/OrderDetailScreen';
import { OrdersScreen } from '@/features/order/screens/OrdersScreen';
import type { OrdersStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}
