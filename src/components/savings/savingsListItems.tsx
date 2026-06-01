import React, { memo } from 'react';
import { Text, View } from 'react-native';

import type { SavingsCoupon, SavingsCouponCategory } from '../../mocks/savings.mock';
import { SAVINGS_REFER_REWARD, SAVINGS_WALLET_BALANCE } from '../../mocks/savings.mock';

import { CouponCard } from './CouponCard';
import { MembershipBanner } from './MembershipBanner';
import {
  BestCouponsSectionTitle,
  SavingsCategoryTabs,
} from './SavingsCategoryTabs';
import { SubscriptionBanner } from './SubscriptionBanner';
import { WalletReferCards } from './WalletReferCards';
import { savingsColors } from './savings.styles';

function EmptyCouponsMessage() {
  return (
    <View className="items-center px-4 pb-2 pt-1">
      <Text className="text-center text-[14px] text-pillfly-muted">
        No coupons in this category yet.
      </Text>
    </View>
  );
}

export const SavingsListHeader = memo(function SavingsListHeader({
  activeCategory,
  onChangeCategory,
  showEmptyCoupons = false,
}: {
  activeCategory: SavingsCouponCategory;
  onChangeCategory: (category: SavingsCouponCategory) => void;
  showEmptyCoupons?: boolean;
}) {
  return (
    <>
      <View className="bg-pillfly-background px-4 pt-4">
        <MembershipBanner />
        <View className="mt-3">
          <WalletReferCards
            walletBalance={SAVINGS_WALLET_BALANCE}
            referReward={SAVINGS_REFER_REWARD}
          />
        </View>
      </View>

      <View
        className="pt-5"
        style={{ backgroundColor: savingsColors.couponSectionBg }}
      >
        <BestCouponsSectionTitle />
        <SavingsCategoryTabs
          activeCategory={activeCategory}
          onChangeCategory={onChangeCategory}
        />
        {showEmptyCoupons ? <EmptyCouponsMessage /> : <View className="h-3" />}
      </View>
    </>
  );
});

SavingsListHeader.displayName = 'SavingsListHeader';

export const SavingsCouponListItem = memo(function SavingsCouponListItem({
  coupon,
}: {
  coupon: SavingsCoupon;
}) {
  return (
    <View className="mb-3 px-4">
      <CouponCard coupon={coupon} />
    </View>
  );
});

SavingsCouponListItem.displayName = 'SavingsCouponListItem';

export const SavingsSubscriptionListItem = memo(function SavingsSubscriptionListItem() {
  return (
    <View className="mb-3 px-4">
      <SubscriptionBanner />
    </View>
  );
});

SavingsSubscriptionListItem.displayName = 'SavingsSubscriptionListItem';
