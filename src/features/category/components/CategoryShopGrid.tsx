import React from 'react';
import { Pressable, View } from 'react-native';

import type { Category } from '@/types/category.types';

import { CATEGORY_GRID_GAP } from './categoryGridLayout';
import { ShopTile } from './ShopTile';

export function CategoryShopGrid({
  categories,
  tileWidth,
  onCategoryPress,
}: {
  categories: readonly Category[];
  tileWidth: number;
  onCategoryPress?: (category: Category) => void;
}) {
  return (
    <View className="mb-8 flex-row flex-wrap" style={{ gap: CATEGORY_GRID_GAP }}>
      {categories.map((row) => {
        const tile = (
          <ShopTile
            title={row.title}
            subtitle={row.subtitle ?? ''}
            bg={row.tileBg}
            icon={row.image ?? undefined}
            width={tileWidth}
          />
        );

        if (!onCategoryPress) {
          return (
            <View key={row.id}>{tile}</View>
          );
        }

        return (
          <Pressable
            key={row.id}
            accessibilityRole="button"
            accessibilityLabel={`Browse ${row.title}`}
            onPress={() => onCategoryPress(row)}
            className="active:opacity-90"
          >
            {tile}
          </Pressable>
        );
      })}
    </View>
  );
}
