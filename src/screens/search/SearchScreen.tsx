import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, spacing } from '../../theme';

/**
 * Shared search — medicines, categories, lab tests, brands.
 * Registered on AppStack (not inside bottom tabs).
 */
export function SearchScreen() {
  const [query, setQuery] = useState('');

  const onSubmit = useCallback(() => {
    if (!query.trim()) {
      return;
    }
    // Hook API / navigation to results in a later iteration.
  }, [query]);

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search medicines, tests, brands…"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={onSubmit}
          style={({ pressed }) => [styles.searchCta, pressed && styles.pressed]}
        >
          <Text style={styles.searchCtaLabel}>Search</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.hintBlock}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hintTitle}>Suggestions</Text>
        <Text style={styles.hintBody}>
          Trending searches, recent history, and voice search can plug in here.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  searchCta: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: {
    opacity: 0.9,
  },
  searchCtaLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  scroll: {
    flex: 1,
  },
  hintBlock: {
    padding: spacing.lg,
  },
  hintTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hintBody: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
