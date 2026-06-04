import React, { memo } from "react";

import { Text, View } from "react-native";



import { PRODUCT_DETAIL_DISCLAIMER } from "@/mocks/productDetail.mock";



import { PDP_HORIZONTAL_PADDING, PDP_SUBTITLE_CLASS } from "./productDetail.constants";



export const ProductDetailDisclaimer = memo(function ProductDetailDisclaimer() {

  return (

    <View className={`bg-pillfly-background ${PDP_HORIZONTAL_PADDING} pb-4 pt-2`}>

      <Text className={`text-[11px] leading-[16px] ${PDP_SUBTITLE_CLASS}`}>

        {PRODUCT_DETAIL_DISCLAIMER}

      </Text>

    </View>

  );

});



ProductDetailDisclaimer.displayName = "ProductDetailDisclaimer";

