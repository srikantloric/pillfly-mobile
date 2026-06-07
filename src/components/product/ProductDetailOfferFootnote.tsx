import React, { memo } from "react";
import { Text } from "react-native";

import { PRODUCT_DETAIL_OFFER_FOOTNOTE } from "@/mocks/productDetail.mock";

import { PDP_SUBTITLE_CLASS } from "./productDetail.constants";

export const ProductDetailOfferFootnote = memo(function ProductDetailOfferFootnote() {
  return (
    <Text className={`mt-2 ${PDP_SUBTITLE_CLASS}`}>{PRODUCT_DETAIL_OFFER_FOOTNOTE}</Text>
  );
});

ProductDetailOfferFootnote.displayName = "ProductDetailOfferFootnote";
