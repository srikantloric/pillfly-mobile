import React, { memo, useCallback, useMemo, useState } from "react";

import { Text, View, type LayoutChangeEvent } from "react-native";



import { ReadMoreText } from "@/components/ui";

import type { Product } from "@/types/product";

import {

  MEDICAL_INFO_TABS,

  getProductMedicalDescription,

  getProductMedicalSections,

  hasProductMedicalContent,

  type MedicalInfoTabId,

} from "@/utils/productMedicalContent";



import { getMedicalSectionIcon } from "./medicalSectionIcons";

import { ProductDetailMedicalSection } from "./ProductDetailMedicalSection";

import { ProductDetailMedicalTabs } from "./ProductDetailMedicalTabs";

import {

  PDP_BODY_TEXT_CLASS,

  PDP_DIVIDER,

  PDP_HORIZONTAL_PADDING,

  PDP_ROW_PADDING,

  PDP_SECTION_SPACING,

  PDP_SECTION_TITLE_CLASS,

} from "./productDetail.constants";



type Props = {

  product: Product;

  onSectionLayout?: (tabId: MedicalInfoTabId, sectionY: number) => void;

  onTabsLayout?: (height: number) => void;

  onTabPress?: (tabId: MedicalInfoTabId) => void;

};



export const ProductDetailMedicalContent = memo(function ProductDetailMedicalContent({

  product,

  onSectionLayout,

  onTabsLayout,

  onTabPress,

}: Props) {

  const description = getProductMedicalDescription(product);

  const sections = useMemo(() => getProductMedicalSections(product), [product]);



  const visibleTabs = useMemo(

    () => MEDICAL_INFO_TABS.filter((tab) => sections.some((section) => section.id === tab.id)),

    [sections],

  );



  const [activeTabId, setActiveTabId] = useState<MedicalInfoTabId>(

    visibleTabs[0]?.id ?? "uses",

  );



  const handleTabPress = useCallback(

    (tabId: MedicalInfoTabId) => {

      setActiveTabId(tabId);

      onTabPress?.(tabId);

    },

    [onTabPress],

  );



  const handleSectionLayout = useCallback(

    (tabId: MedicalInfoTabId) => (event: LayoutChangeEvent) => {

      onSectionLayout?.(tabId, event.nativeEvent.layout.y);

    },

    [onSectionLayout],

  );



  if (!hasProductMedicalContent(product)) {

    return null;

  }



  return (

    <View className={`${PDP_SECTION_SPACING} bg-pillfly-background`}>

      {description ? (

        <View className={`${PDP_DIVIDER} bg-pillfly-surface ${PDP_HORIZONTAL_PADDING} ${PDP_ROW_PADDING}`}>

          <Text className={`mb-3 ${PDP_SECTION_TITLE_CLASS}`}>Medical description</Text>

          <ReadMoreText text={description} collapsedLines={3} textClassName={PDP_BODY_TEXT_CLASS} />

        </View>

      ) : null}



      {visibleTabs.length > 0 ? (

        <>

          <ProductDetailMedicalTabs

            tabs={visibleTabs}

            activeTabId={activeTabId}

            onTabPress={handleTabPress}

            onLayoutHeight={onTabsLayout}

          />



          {sections.map((section) => (

            <ProductDetailMedicalSection

              key={section.id}

              title={section.title}

              icon={getMedicalSectionIcon(section.id)}

              bullets={section.bullets}

              onLayout={handleSectionLayout(section.id)}

            />

          ))}

        </>

      ) : null}

    </View>

  );

});



ProductDetailMedicalContent.displayName = "ProductDetailMedicalContent";

