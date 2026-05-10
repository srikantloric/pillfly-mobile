import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../types/navigation.types';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchResults'>;

export function SearchResultsScreen({ route }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Results for “{route.params.query}”</Text>
      <Text style={styles.muted}>Connect product / medicine lists and filters here.</Text>
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
    fontSize: 18,
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
