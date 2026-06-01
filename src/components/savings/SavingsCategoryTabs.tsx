import React, { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { SavingsCouponCategory } from '../../mocks/savings.mock';
import { SAVINGS_CATEGORY_CHIPS } from '../../mocks/savings.mock';

import { savingsColors } from './savings.styles';

type Props = {
  activeCategory: SavingsCouponCategory;
  onChangeCategory: (category: SavingsCouponCategory) => void;
};

export const SavingsCategoryTabs = memo(function SavingsCategoryTabs({
  activeCategory,
  onChangeCategory,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4 pb-1"
    >
      {SAVINGS_CATEGORY_CHIPS.map((chip) => (
        <CategoryChip
          key={chip.id}
          label={chip.label}
          categoryId={chip.id}
          active={activeCategory === chip.id}
          onChangeCategory={onChangeCategory}
        />
      ))}
    </ScrollView>
  );
});

SavingsCategoryTabs.displayName = 'SavingsCategoryTabs';

const CategoryChip = memo(function CategoryChip({
  label,
  categoryId,
  active,
  onChangeCategory,
}: {
  label: string;
  categoryId: SavingsCouponCategory;
  active: boolean;
  onChangeCategory: (category: SavingsCouponCategory) => void;
}) {
  const handlePress = useCallback(() => {
    onChangeCategory(categoryId);
  }, [categoryId, onChangeCategory]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} coupons`}
      onPress={handlePress}
      className="rounded-full border px-4 py-2 active:opacity-90"
      style={{
        borderColor: active ? savingsColors.chipActiveBorder : savingsColors.chipBorder,
        backgroundColor: active ? savingsColors.chipActiveBg : '#FFFFFF',
      }}
    >
      <Text
        className="text-[13px] font-semibold"
        style={{ color: active ? savingsColors.chipActiveBorder : savingsColors.chipText }}
      >
        {label}
      </Text>
    </Pressable>
  );
});

CategoryChip.displayName = 'CategoryChip';

export function BestCouponsSectionTitle() {
  return (
    <View
      className="mb-3 flex-row items-center gap-3 px-4"
      accessibilityRole="header"
    >
      <View className="h-px flex-1 bg-slate-300/80" />
      <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        Best Coupons
      </Text>
      <View className="h-px flex-1 bg-slate-300/80" />
    </View>
  );
}
