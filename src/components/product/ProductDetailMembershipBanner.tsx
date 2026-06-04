import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { profileColors } from "@/components/profile/profile.styles";
type Props = {
  creditsAmount: number;
  onPressViewBenefits?: () => void;
  onPressAddPlus?: () => void;
};

export const ProductDetailMembershipBanner = memo(function ProductDetailMembershipBanner({
  creditsAmount,
  onPressViewBenefits,
  onPressAddPlus,
}: Props) {
  return (
    <View className="mt-3 overflow-hidden rounded-xl bg-[#EDE9FE] px-3.5 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center">
            <Text className="text-[13px] font-semibold text-pillfly-brand-purple">
              Get ₹{creditsAmount} Credits with{" "}
            </Text>
            <View className="flex-row items-center">
              <Feather name="star" size={12} color={profileColors.plusGold} />
              <Text className="ml-0.5 text-[13px] font-bold text-pillfly-brand-purple">
                PLUS
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all Plus benefits"
            onPress={onPressViewBenefits}
            className="mt-1 self-start active:opacity-80"
          >
            <Text className="text-[12px] font-semibold text-pillfly-brand-purple underline">
              View all benefits
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Plus membership"
          onPress={onPressAddPlus}
          className="pt-0.5 active:opacity-80"
        >
          <Text className="text-[13px] font-bold uppercase tracking-wide text-pillfly-brand-purple">
            + ADD PLUS
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

ProductDetailMembershipBanner.displayName = "ProductDetailMembershipBanner";
