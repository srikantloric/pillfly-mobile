import React, { memo } from "react";

import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@react-native-vector-icons/ionicons";



import {

  PRODUCT_DETAIL_SHARE_CHANNELS,

  type ProductDetailShareChannel,

  type ProductDetailShareChannelId,

} from "@/features/product/mocks/detail.mock";

import { SectionHeaderRow } from "@/components/ui";



import {

  PDP_HORIZONTAL_PADDING,

  PDP_SECTION_SPACING,

} from "../constants/productDetail.constants";



type Props = {

  onPressChannel?: (channelId: ProductDetailShareChannelId) => void;

};



export const ProductDetailShareSection = memo(function ProductDetailShareSection({

  onPressChannel,

}: Props) {

  return (

    <View className={`${PDP_SECTION_SPACING} bg-pillfly-background ${PDP_HORIZONTAL_PADDING} pb-2 pt-4`}>

      <SectionHeaderRow title="Share with friends" className="mb-4" />

      <View className="flex-row items-center gap-6 pb-2">

        {PRODUCT_DETAIL_SHARE_CHANNELS.map((channel) => (

          <ShareChannelButton

            key={channel.id}

            channel={channel}

            onPress={() => onPressChannel?.(channel.id)}

          />

        ))}

      </View>

    </View>

  );

});



ProductDetailShareSection.displayName = "ProductDetailShareSection";



const ShareChannelButton = memo(function ShareChannelButton({

  channel,

  onPress,

}: {

  channel: ProductDetailShareChannel;

  onPress?: () => void;

}) {

  return (

    <Pressable

      accessibilityRole="button"

      accessibilityLabel={`Share on ${channel.label}`}

      onPress={onPress}

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

  );

});



ShareChannelButton.displayName = "ShareChannelButton";

