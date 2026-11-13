import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation.types';
import { ProfileScreen } from '@/features/profile';
import { OrderDetailScreen } from '@/features/order/screens/OrderDetailScreen';
import { OrdersScreen } from '@/features/order/screens/OrdersScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: true, title: 'Orders' }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: true, title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
}
