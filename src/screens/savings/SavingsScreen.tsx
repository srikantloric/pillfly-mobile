import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, View, type ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCartSummary } from '@/hooks/useCartSummary';
import { SavingsHeader } from '../../components/header';
import {
  SavingsCouponListItem,
  SavingsListHeader,
  SavingsSubscriptionListItem,
  savingsColors,
} from '../../components/savings';
import {
  SAVINGS_COUPONS,
  type SavingsCoupon,
  type SavingsCouponCategory,
} from '../../mocks/savings.mock';

const SUBSCRIPTION_ROW_ID = 'subscription-banner';
const SUBSCRIPTION_INSERT_INDEX = 2;

type SavingsListRow =
  | { kind: 'coupon'; coupon: SavingsCoupon }
  | { kind: 'subscription'; id: typeof SUBSCRIPTION_ROW_ID };

function buildListData(coupons: SavingsCoupon[]): SavingsListRow[] {
  const rows: SavingsListRow[] = coupons.map((coupon) => ({
    kind: 'coupon',
    coupon,
  }));

  const subscriptionRow: SavingsListRow = {
    kind: 'subscription',
    id: SUBSCRIPTION_ROW_ID,
  };

  if (rows.length > SUBSCRIPTION_INSERT_INDEX) {
    rows.splice(SUBSCRIPTION_INSERT_INDEX, 0, subscriptionRow);
  } else {
    rows.push(subscriptionRow);
  }

  return rows;
}

export function SavingsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCartSummary();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState<SavingsCouponCategory>('all');

  const filteredCoupons = useMemo(() => {
    if (activeCategory === 'all') {
      return SAVINGS_COUPONS;
    }
    return SAVINGS_COUPONS.filter((coupon) => coupon.category === activeCategory);
  }, [activeCategory]);

  const listData = useMemo(() => buildListData(filteredCoupons), [filteredCoupons]);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      }),
    [scrollY],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: insets.bottom + 24,
      flexGrow: 1 as const,
    }),
    [insets.bottom],
  );

  const listHeader = useMemo(
    () => (
      <SavingsListHeader
        activeCategory={activeCategory}
        onChangeCategory={setActiveCategory}
        showEmptyCoupons={filteredCoupons.length === 0}
      />
    ),
    [activeCategory, filteredCoupons.length],
  );

  const keyExtractor = useCallback((item: SavingsListRow) => {
    return item.kind === 'subscription' ? item.id : item.coupon.id;
  }, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<SavingsListRow>) => {
    if (item.kind === 'subscription') {
      return <SavingsSubscriptionListItem />;
    }
    return <SavingsCouponListItem coupon={item.coupon} />;
  }, []);

  return (
    <View className="flex-1 bg-pillfly-background">
      <SavingsHeader
        scrollY={scrollY}
        insets={insets}
        navigation={navigation}
        cartBadgeCount={itemCount}
      />

      <Animated.FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={8}
        removeClippedSubviews={false}
        contentContainerStyle={contentContainerStyle}
        style={{ backgroundColor: savingsColors.couponSectionBg }}
      />
    </View>
  );
}
