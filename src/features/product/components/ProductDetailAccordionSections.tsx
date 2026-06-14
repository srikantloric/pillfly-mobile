import React, { memo, useMemo } from "react";

import { View } from "react-native";



import { Accordion } from "@/components/ui";

import type { Product } from "@/features/product/types/product";

import { getProductAccordionSections } from "@/features/product/utils/productDetailAccordion";



import { ProductDetailAccordionBody } from "./ProductDetailAccordionBody";

import { PDP_HORIZONTAL_PADDING, PDP_SECTION_SPACING } from "../constants/productDetail.constants";



type Props = {

  product: Product;

};



export const ProductDetailAccordionSections = memo(function ProductDetailAccordionSections({

  product,

}: Props) {

  const sections = useMemo(() => getProductAccordionSections(product), [product]);



  if (sections.length === 0) {

    return null;

  }



  return (

    <View className={`${PDP_SECTION_SPACING} bg-pillfly-background pb-4 ${PDP_HORIZONTAL_PADDING}`}>

      {sections.map((section) => (

        <Accordion key={section.id} title={section.title}>

          <ProductDetailAccordionBody section={section} />

        </Accordion>

      ))}

    </View>

  );

});



ProductDetailAccordionSections.displayName = "ProductDetailAccordionSections";

