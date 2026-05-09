import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types/navigation.types';
import { AuthSignInScreen } from '../screens/auth/AuthSignInScreen';
import { AuthSignUpScreen } from '../screens/auth/AuthSignUpScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AuthSignIn" component={AuthSignInScreen} options={{ title: 'Sign in' }} />
      <Stack.Screen name="AuthSignUp" component={AuthSignUpScreen} options={{ title: 'Sign up' }} />
    </Stack.Navigator>
  );
}
