import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

/**
 * Shared profile hub — account, orders, addresses, health records.
 * Registered on AppStack (not inside bottom tabs).
 */
export function ProfileScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.headline}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account and healthcare preferences.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <PlaceholderRow label="Personal details" />
        <PlaceholderRow label="Saved addresses" />
        <PlaceholderRow label="Payment methods" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <PlaceholderRow label="Medicines & wellness" />
        <PlaceholderRow label="Lab tests & diagnostics" />
      </View>
    </ScrollView>
  );
}

function PlaceholderRow({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
