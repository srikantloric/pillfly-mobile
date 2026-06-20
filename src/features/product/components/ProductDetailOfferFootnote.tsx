import React, { memo } from "react";
import { Text } from "react-native";

import { PRODUCT_DETAIL_OFFER_FOOTNOTE } from "@/features/product/mocks/detail.mock";

import { PDP_SUBTITLE_CLASS } from "../constants/productDetail.constants";

export const ProductDetailOfferFootnote = memo(function ProductDetailOfferFootnote() {
  return (
    <Text className={`mt-2 ${PDP_SUBTITLE_CLASS}`}>{PRODUCT_DETAIL_OFFER_FOOTNOTE}</Text>
  );
});

ProductDetailOfferFootnote.displayName = "ProductDetailOfferFootnote";
