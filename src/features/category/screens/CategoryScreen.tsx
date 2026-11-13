import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { useCartSummary } from '@/features/cart';
import { colors } from '@/theme';
import { toCustomerMessage } from '@/utils/customerMessage';

import { CategoriesHeader } from '../components/CategoriesHeader';
import { CategoryShopGrid, categoryGridTileWidth } from '../components';
import { useCategories } from '../hooks/useCategories';

import { categoryScreenStyles } from './categoryScreen.styles';

export function CategoryScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { lineCount } = useCartSummary();
  const { categories, loading, error, retry } = useCategories();
  const tileW = categoryGridTileWidth(windowWidth);

  const scrollContentStyle = useMemo(
    () => [categoryScreenStyles.scrollContentGutter, { paddingBottom: insets.bottom + 96 }],
    [insets.bottom],
  );

  return (
    <View className="flex-1 bg-pillfly-background">
      <CategoriesHeader navigation={navigation} cartBadgeCount={lineCount} />
      {loading && categories.length === 0 ? (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-3 text-[13px] font-bold tracking-wide text-pillfly-section">
            BROWSE BY CATEGORY
          </Text>
          {error && categories.length === 0 ? (
            <View className="rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-5">
              <Text className="text-center text-[14px] text-pillfly-promo-red">
                {toCustomerMessage(error)}
              </Text>
              <View className="mt-4">
                <PrimaryButton
                  label="Retry"
                  accessibilityLabel="Retry loading categories"
                  onPress={retry}
                />
              </View>
            </View>
          ) : categories.length === 0 ? (
            <Text className="text-center text-[14px] text-pillfly-muted">No categories available</Text>
          ) : (
            <CategoryShopGrid categories={categories} tileWidth={tileW} />
          )}
        </ScrollView>
      )}
    </View>
  );
}
