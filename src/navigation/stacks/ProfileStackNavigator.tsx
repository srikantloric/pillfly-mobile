import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddressFormScreen } from '@/features/address';
import { ProfileScreen } from '@/features/profile';
import type { ProfileStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
    </Stack.Navigator>
  );
}
