import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { SectionHeaderRow } from "@/components/ui";
import {
  PRODUCT_DETAIL_DISCLAIMER,
  PRODUCT_DETAIL_SHARE_CHANNELS,
  type ProductDetailShareChannelId,
} from "@/features/product/mocks/detail.mock";
import { getProductDetailOffers } from "@/features/product/utils/productDetailOffers";
import type { SavingsCoupon } from "@/features/savings";
import { CouponCard } from "@/features/savings/components/CouponCard";

import {
  PDP_HORIZONTAL_PADDING,
  PDP_SECTION_SPACING,
  PDP_SUBTITLE_CLASS,
} from "../constants/productDetail.constants";

type Props = {
  onPressCoupon?: (coupon: SavingsCoupon) => void;
  onPressShareChannel?: (channelId: ProductDetailShareChannelId) => void;
};

/** Offers, share buttons and the medical disclaimer at the bottom of the product page. */
export const ProductDetailFooterSections = memo(function ProductDetailFooterSections({
  onPressCoupon,
  onPressShareChannel,
}: Props) {
  const offers = getProductDetailOffers();

  return (
    <View>
      {offers.length > 0 ? (
        <View className={`${PDP_SECTION_SPACING} bg-pillfly-surface ${PDP_HORIZONTAL_PADDING} pb-4 pt-4`}>
          <SectionHeaderRow title="Offers just for you" className="mb-3" />
          <View className="gap-3">
            {offers.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} onPress={onPressCoupon} />
            ))}
          </View>
        </View>
      ) : null}

      <View className={`${PDP_SECTION_SPACING} bg-pillfly-background ${PDP_HORIZONTAL_PADDING} pb-2 pt-4`}>
        <SectionHeaderRow title="Share with friends" className="mb-4" />
        <View className="flex-row items-center gap-6 pb-2">
          {PRODUCT_DETAIL_SHARE_CHANNELS.map((channel) => (
            <Pressable
              key={channel.id}
              accessibilityRole="button"
              accessibilityLabel={`Share on ${channel.label}`}
              onPress={() => onPressShareChannel?.(channel.id)}
              className="items-center active:opacity-80"
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: channel.backgroundColor }}
              >
                <Ionicons
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  name={channel.iconName}
                  size={26}
                  color="#FFFFFF"
                />
              </View>
              <Text className="mt-1.5 text-[12px] font-medium text-pillfly-muted">{channel.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className={`bg-pillfly-background ${PDP_HORIZONTAL_PADDING} pb-4 pt-2`}>
        <Text className={`text-[11px] leading-[16px] ${PDP_SUBTITLE_CLASS}`}>
          {PRODUCT_DETAIL_DISCLAIMER}
        </Text>
      </View>
    </View>
  );
});
