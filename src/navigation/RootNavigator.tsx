import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RNBootSplash from 'react-native-bootsplash';

import { useAuth } from '@/features/auth';
import type { RootStackParamList } from '../types/navigation.types';
import { AuthStackNavigator } from './AuthStackNavigator';
import { AppStackNavigator } from './AppStackNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, hasHydrated, restoreSession } = useAuth();

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (hasHydrated) {
      void RNBootSplash.hide({ fade: true });
    }
  }, [hasHydrated]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isAuthenticated ? (
        <Stack.Screen name="Application" component={AppStackNavigator} />
      ) : (
        <Stack.Screen name="Authentication" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
}
