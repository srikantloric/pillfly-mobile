import React from 'react';
import { View } from 'react-native';

import type { Category } from '@/types/category.types';

import { CATEGORY_GRID_GAP } from './categoryGridLayout';
import { ShopTile } from './ShopTile';

export function CategoryShopGrid({
  categories,
  tileWidth,
}: {
  categories: readonly Category[];
  tileWidth: number;
}) {
  return (
    <View className="mb-8 flex-row flex-wrap" style={{ gap: CATEGORY_GRID_GAP }}>
      {categories.map((row) => (
        <ShopTile
          key={row.id}
          title={row.title}
          subtitle={row.subtitle ?? ''}
          bg={row.tileBg}
          icon={row.image}
          width={tileWidth}
        />
      ))}
    </View>
  );
}
