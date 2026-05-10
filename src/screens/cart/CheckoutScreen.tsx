import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

export function CheckoutScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.muted}>Address, payment, prescription verification — integrate next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  muted: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
