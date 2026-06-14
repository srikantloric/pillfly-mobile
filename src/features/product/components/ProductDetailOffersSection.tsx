import React, { memo } from "react";

import { View } from "react-native";



import { CouponCard } from "@/components/savings/CouponCard";

import { SectionHeaderRow } from "@/components/ui";

import type { SavingsCoupon } from "@/mocks/savings.mock";

import { getProductDetailOffers } from "@/features/product/utils/productDetailOffers";



import {

  PDP_HORIZONTAL_PADDING,

  PDP_SECTION_SPACING,

} from "../constants/productDetail.constants";



type Props = {

  onPressCoupon?: (coupon: SavingsCoupon) => void;

};



export const ProductDetailOffersSection = memo(function ProductDetailOffersSection({

  onPressCoupon,

}: Props) {

  const offers = getProductDetailOffers();



  if (offers.length === 0) {

    return null;

  }



  return (

    <View className={`${PDP_SECTION_SPACING} bg-pillfly-surface ${PDP_HORIZONTAL_PADDING} pb-4 pt-4`}>

      <SectionHeaderRow title="Offers just for you" className="mb-3" />

      <View className="gap-3">

        {offers.map((coupon) => (

          <CouponCard key={coupon.id} coupon={coupon} onPress={onPressCoupon} />

        ))}

      </View>

    </View>

  );

});



ProductDetailOffersSection.displayName = "ProductDetailOffersSection";

