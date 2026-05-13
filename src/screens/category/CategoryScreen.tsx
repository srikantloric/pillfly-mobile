import React, { useMemo } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoriesHeader } from '../../components/header';
import { CategoryShopGrid, categoryGridTileWidth } from '../../components/category';
import { CATEGORIES } from '../../mocks/categories.mock';

import { categoryScreenStyles } from './categoryScreen.styles';

export function CategoryScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const tileW = categoryGridTileWidth(windowWidth);

  const scrollContentStyle = useMemo(
    () => [categoryScreenStyles.scrollContentGutter, { paddingBottom: insets.bottom + 24 }],
    [insets.bottom],
  );

  return (
    <View className="flex-1 bg-pillfly-background">
      <CategoriesHeader navigation={navigation} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 text-[13px] font-bold tracking-wide text-pillfly-section">
          BROWSE BY CATEGORY
        </Text>
        <CategoryShopGrid categories={CATEGORIES} tileWidth={tileW} />
      </ScrollView>
    </View>
  );
}
