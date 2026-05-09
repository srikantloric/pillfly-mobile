import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList, RootStackParamList } from '../../types/navigation.types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthSignIn'>;

export function AuthSignInScreen({ navigation }: Props) {
  const enterApp = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Application');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sign in</Text>
      <Button title="Continue to app (dev)" onPress={enterApp} />
      <Button title="Sign up" onPress={() => navigation.navigate('AuthSignUp')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
});
