import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

/**
 * Shared cart — line items, prescriptions, checkout entry.
 * Registered on AppStack (not inside bottom tabs).
 */
export function CartScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.headline}>Cart</Text>
      <Text style={styles.subtitle}>
        Your bag is shared across tabs. Rx uploads and lab bundles can surface here.
      </Text>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptyBody}>Add items from home, categories, or search.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checkout readiness</Text>
        <PlaceholderRow label="Delivery address" />
        <PlaceholderRow label="Slot / lab collection" />
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
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
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
