import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import type { OfferPackage } from '../../mocks/offers.mock';
import { OFFER_CONTENT_PADDING, offerCardShadow, offerColors } from './offer.styles';

type Props = {
  pkg: OfferPackage;
  index?: number;
  onBookPress?: (pkg: OfferPackage) => void;
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const OfferPackageCard = memo(function OfferPackageCard({
  pkg,
  index = 0,
  onBookPress,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay: Math.min(index * 70, 280),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay: Math.min(index * 70, 280),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  const handleBook = useCallback(() => {
    onBookPress?.(pkg);
  }, [onBookPress, pkg]);

  return (
    <Animated.View
      style={[
        offerCardShadow.card,
        {
          opacity,
          transform: [{ translateY }],
          marginHorizontal: OFFER_CONTENT_PADDING,
          marginBottom: 16,
        },
      ]}
    >
      <View className="overflow-hidden rounded-2xl bg-pillfly-surface">
        <View
          className="items-center justify-center py-2"
          style={{ backgroundColor: offerColors.ribbonTeal }}
        >
          <Text className="text-[12px] font-extrabold tracking-wide text-white">
            BUY 1 GET 1 FREE
          </Text>
        </View>

        <View className="px-4 pb-3 pt-3.5">
          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-bold leading-5 text-pillfly-ink" numberOfLines={4}>
                {pkg.title}
              </Text>
            </View>
            <PackageThumbnail source={pkg.image} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${pkg.testCount} tests included`}
            hitSlop={6}
            className="mt-2.5 flex-row items-center self-start active:opacity-75"
          >
            <MaterialIcons name="science" size={16} color={offerColors.testCount} />
            <Text
              className="ml-1.5 text-[13px] underline"
              style={{ color: offerColors.testCount }}
            >
              {pkg.testCount} Tests
            </Text>
          </Pressable>

          <View className="mt-4 flex-row items-end justify-between">
            <View className="min-w-0 flex-1 pr-3">
              <Text className="text-[12px]" style={{ color: offerColors.priceLabel }}>
                Price for 2 people
              </Text>
              <View className="mt-0.5 flex-row flex-wrap items-baseline gap-1">
                <Text className="text-[22px] font-extrabold text-pillfly-ink">
                  {formatInr(pkg.priceForTwo)}
                </Text>
                <Text className="text-[12px] font-medium" style={{ color: offerColors.perPersonRed }}>
                  ({formatInr(pkg.pricePerPerson)} per person)
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Book ${pkg.title} for 2 people`}
              onPress={handleBook}
              className="rounded-xl px-4 py-3 active:opacity-90"
              style={{ backgroundColor: offerColors.ctaButton }}
            >
              <Text className="text-[13px] font-bold text-white">Book for 2</Text>
            </Pressable>
          </View>
        </View>

        <View className="border-t px-4 py-3" style={{ borderTopColor: offerColors.divider }}>
          <View className="flex-row items-start gap-2">
            <Feather name="star" size={14} color={offerColors.footerText} style={{ marginTop: 2 }} />
            <Text
              className="flex-1 text-[12px] leading-[18px]"
              style={{ color: offerColors.footerText }}
            >
              {pkg.description}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

OfferPackageCard.displayName = 'OfferPackageCard';

const PackageThumbnail = memo(function PackageThumbnail({
  source,
}: {
  source: ImageSourcePropType;
}) {
  return (
    <View className="h-[72px] w-[72px] overflow-hidden rounded-xl bg-slate-100">
      <Image source={source} className="h-full w-full" resizeMode="cover" />
    </View>
  );
});

PackageThumbnail.displayName = 'PackageThumbnail';
