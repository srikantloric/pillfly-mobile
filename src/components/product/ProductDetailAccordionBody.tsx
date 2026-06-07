import React, { memo } from "react";
import { Text, View } from "react-native";

import { BulletList } from "@/components/ui";
import type { ProductAccordionSection } from "@/utils/productDetailAccordion";

import { PDP_BODY_TEXT_CLASS } from "./productDetail.constants";

const bodyTextClass = PDP_BODY_TEXT_CLASS;

type Props = {
  section: ProductAccordionSection;
};

export const ProductDetailAccordionBody = memo(function ProductDetailAccordionBody({
  section,
}: Props) {
  if (section.faqItems?.length) {
    return (
      <View>
        {section.faqItems.map((item, index) => (
          <View
            key={`${index}-${item.question.slice(0, 16)}`}
            className={index < section.faqItems!.length - 1 ? "mb-3" : ""}
          >
            <Text className={`${bodyTextClass} font-semibold text-pillfly-ink`}>
              {item.question}
            </Text>
            <Text className={`mt-1 ${bodyTextClass}`}>{item.answer}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {section.paragraphs?.map((paragraph, index) => (
        <Text
          key={`p-${index}`}
          className={`${bodyTextClass} ${index < section.paragraphs!.length - 1 ? "mb-2" : ""}`}
        >
          {paragraph}
        </Text>
      ))}
      {section.bullets?.length ? (
        <BulletList
          items={section.bullets}
          className={section.paragraphs?.length ? "mt-2" : ""}
        />
      ) : null}
    </View>
  );
});

ProductDetailAccordionBody.displayName = "ProductDetailAccordionBody";
