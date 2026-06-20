import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { AuthStackNavigator } from './AuthStackNavigator';
import { AppStackNavigator } from './AppStackNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const INITIAL_ROUTE: keyof RootStackParamList = 'Authentication';

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName={INITIAL_ROUTE} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Authentication" component={AuthStackNavigator} />
      <Stack.Screen name="Application" component={AppStackNavigator} />
    </Stack.Navigator>
  );
}
