import React, { memo } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";

import { PAIN_SUPPORT_BANNER_IMAGE_URI } from "@/mocks/productDetail.mock";
import { colors } from "@/theme";

type Props = {
  onPressCta?: () => void;
};

export const ProductDetailPainSupportBanner = memo(function ProductDetailPainSupportBanner({
  onPressCta,
}: Props) {
  return (
    <ImageBackground
      source={{ uri: PAIN_SUPPORT_BANNER_IMAGE_URI }}
      className="overflow-hidden rounded-2xl"
      resizeMode="cover"
    >
      <View
        className="min-h-[168px] justify-between px-4 py-4"
        style={{ backgroundColor: colors.imageOverlay }}
      >
        <View className="max-w-[72%]">
          <Text className="text-[18px] font-bold leading-[24px]" style={{ color: colors.surface }}>
            <Text className="text-pillfly-promo-red">Pain</Text> is a signal from your body,
          </Text>
          <Text
            className="mt-1 text-[13px] leading-[18px]"
            style={{ color: colors.onImageText }}
          >
            Ignoring it can delay recovery.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get the right support"
            onPress={onPressCta}
            className="mt-3 self-start rounded-lg px-4 py-2.5 active:opacity-90"
            style={{ backgroundColor: colors.bannerCta }}
          >
            <Text className="text-[13px] font-bold" style={{ color: colors.surface }}>
              Get the right support
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 flex-row items-end justify-between gap-2">
          <Text
            className="max-w-[70%] text-[9px] leading-[12px]"
            style={{ color: colors.onImageTextMuted }}
          >
            *Valid prescription required for all prescription medicines. Consult a doctor.
          </Text>
          <Text
            className="text-[10px] font-semibold"
            style={{ color: colors.onImageTextSubtle }}
          >
            Powered by Combiflam
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
});

ProductDetailPainSupportBanner.displayName = "ProductDetailPainSupportBanner";
