import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";

import { Accordion, BulletList } from "@/components/ui";
import type { Product } from "@/features/product/types/product";
import {
  getProductAccordionSections,
  type ProductAccordionSection,
} from "@/features/product/utils/productDetailAccordion";

import {
  PDP_BODY_TEXT_CLASS,
  PDP_HORIZONTAL_PADDING,
  PDP_SECTION_SPACING,
} from "../constants/productDetail.constants";

function AccordionBody({ section }: { section: ProductAccordionSection }) {
  const { faqItems, paragraphs, bullets } = section;

  if (faqItems?.length) {
    return (
      <View>
        {faqItems.map((item, index) => (
          <View
            key={`${index}-${item.question.slice(0, 16)}`}
            className={index < faqItems.length - 1 ? "mb-3" : ""}
          >
            <Text className={`${PDP_BODY_TEXT_CLASS} font-semibold text-pillfly-ink`}>
              {item.question}
            </Text>
            <Text className={`mt-1 ${PDP_BODY_TEXT_CLASS}`}>{item.answer}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {paragraphs?.map((paragraph, index) => (
        <Text
          key={`p-${index}`}
          className={`${PDP_BODY_TEXT_CLASS} ${index < paragraphs.length - 1 ? "mb-2" : ""}`}
        >
          {paragraph}
        </Text>
      ))}
      {bullets?.length ? (
        <BulletList items={bullets} className={paragraphs?.length ? "mt-2" : ""} />
      ) : null}
    </View>
  );
}

export const ProductDetailAccordionSections = memo(function ProductDetailAccordionSections({
  product,
}: {
  product: Product;
}) {
  const sections = useMemo(() => getProductAccordionSections(product), [product]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <View className={`${PDP_SECTION_SPACING} bg-pillfly-background pb-4 ${PDP_HORIZONTAL_PADDING}`}>
      {sections.map((section) => (
        <Accordion key={section.id} title={section.title}>
          <AccordionBody section={section} />
        </Accordion>
      ))}
    </View>
  );
});
