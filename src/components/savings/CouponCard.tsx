import React, { memo, useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import Svg, { Line } from 'react-native-svg';

import type { SavingsCoupon } from '../../mocks/savings.mock';
import { copyToClipboard } from '../../utils/copyToClipboard';

import {
  couponDividerStyles,
  savingsCardShadow,
  savingsColors,
} from './savings.styles';

type Props = {
  coupon: SavingsCoupon;
  onPress?: (coupon: SavingsCoupon) => void;
};

export const CouponCard = memo(function CouponCard({ coupon, onPress }: Props) {
  const handlePress = useCallback(() => {
    onPress?.(coupon);
  }, [coupon, onPress]);

  const handleCopy = useCallback(() => {
    void copyToClipboard(coupon.code, `Coupon code ${coupon.code} copied.`);
  }, [coupon.code]);

  return (
    <View
      className="overflow-hidden rounded-2xl bg-pillfly-surface"
      style={savingsCardShadow.card}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${coupon.title}. ${coupon.description}`}
        onPress={handlePress}
        className="active:bg-slate-50/80"
      >
        <View className="flex-row items-center px-3.5 py-3.5">
          <View
            className="mr-3 h-[52px] w-[52px] items-center justify-center rounded-xl"
            style={{ backgroundColor: coupon.brandBg }}
          >
            <Text
              className="text-center text-[12px] font-extrabold leading-4"
              style={{ color: coupon.brandTextColor }}
              numberOfLines={2}
            >
              {coupon.brandLabel}
            </Text>
          </View>

          <View className="min-w-0 flex-1 pr-2">
            <Text className="text-[14px] font-bold leading-5 text-pillfly-ink" numberOfLines={2}>
              {coupon.title}
            </Text>
            <Text className="mt-1 text-[12px] leading-4 text-pillfly-muted" numberOfLines={2}>
              {coupon.description}
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color={savingsColors.chevron} />
        </View>
      </Pressable>

      <CouponDivider />

      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-[13px] text-pillfly-ink" accessibilityLabel={`Code ${coupon.code}`}>
          Code: <Text className="font-bold">{coupon.code}</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Copy coupon code ${coupon.code}`}
          onPress={handleCopy}
          hitSlop={8}
          className="active:opacity-75"
        >
          <Text
            className="text-[12px] font-extrabold uppercase tracking-wide"
            style={{ color: savingsColors.copyCode }}
          >
            Copy Code
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

CouponCard.displayName = 'CouponCard';

const CouponDivider = memo(function CouponDivider() {
  const [lineWidth, setLineWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setLineWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View className="relative h-5 justify-center px-3">
      <View style={[couponDividerStyles.notch, couponDividerStyles.notchLeft]} />
      <View style={[couponDividerStyles.notch, couponDividerStyles.notchRight]} />
      <View className="flex-1 justify-center" onLayout={onLayout}>
        {lineWidth > 0 ? (
          <Svg height={1} width={lineWidth}>
            <Line
              x1={0}
              y1={0}
              x2={lineWidth}
              y2={0}
              stroke={savingsColors.dividerStroke}
              strokeWidth={1}
              strokeDasharray="5 4"
            />
          </Svg>
        ) : null}
      </View>
    </View>
  );
});

CouponDivider.displayName = 'CouponDivider';
