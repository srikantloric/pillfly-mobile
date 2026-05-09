import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function CategoryScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Categories</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
