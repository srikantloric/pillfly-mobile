import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AuthSignUpScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sign up</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});
