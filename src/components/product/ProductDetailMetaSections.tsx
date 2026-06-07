import React, { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { LinkRow } from "@/components/ui";
import {
  MOCK_DELIVERY_INFO,
  PRODUCT_RETURN_POLICY_DAYS,
} from "@/mocks/productDetail.mock";
import type { Product } from "@/types/product";
import {
  getProductSaltCompositionDisplay,
  getProductTherapeuticClassDisplay,
  isMedicineProduct,
} from "@/utils/productDisplay";
import { colors } from "@/theme";

import { ProductDetailMoleculeIcon } from "./ProductDetailMoleculeIcon";
import { ProductDetailPromoCarousel } from "./ProductDetailPromoCarousel";
import {
  PDP_CHEVRON_SIZE,
  PDP_DIVIDER,
  PDP_HORIZONTAL_PADDING,
  PDP_ICON_SLOT,
  PDP_ROW_PADDING,
  PDP_SUBTITLE_CLASS,
} from "./productDetail.constants";

const PDP_ROW_CONTAINER_CLASS = `flex-row items-center bg-pillfly-surface ${PDP_HORIZONTAL_PADDING} ${PDP_ROW_PADDING} active:bg-pillfly-background`;

type Props = {
  product: Product;
  onPressChangePincode?: () => void;
  onPressReturnPolicy?: () => void;
  onPressComposition?: () => void;
  onPressTherapeutic?: () => void;
  onPressPromoCta?: () => void;
};

export const ProductDetailMetaSections = memo(function ProductDetailMetaSections({
  product,
  onPressChangePincode,
  onPressReturnPolicy,
  onPressComposition,
  onPressTherapeutic,
  onPressPromoCta,
}: Props) {
  const saltComposition = getProductSaltCompositionDisplay(product);
  const therapeuticClass = getProductTherapeuticClassDisplay(product);
  const showMedicineMeta = isMedicineProduct(product) && saltComposition && therapeuticClass;

  const locationLine = useMemo(() => {
    const { pincode, areaLabel } = MOCK_DELIVERY_INFO;
    return areaLabel ? `${pincode}, ${areaLabel}` : pincode;
  }, []);

  return (
    <>
      <View className="bg-pillfly-surface">
        <View className={`${PDP_DIVIDER} ${PDP_ROW_PADDING} ${PDP_HORIZONTAL_PADDING}`}>
          <View className="flex-row items-center">
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              className={`${PDP_ICON_SLOT} mr-3`}
            >
              <Feather name="zap" size={20} color={colors.primary} />
            </View>

            <View className="min-w-0 flex-1">
              <Text className="text-[14px] leading-[20px]">
                <Text className="font-bold text-pillfly-ink">Delivery by </Text>
                <Text className="font-semibold text-pillfly-primary">
                  {MOCK_DELIVERY_INFO.etaTime}
                </Text>
              </Text>

              <View className="flex-row items-center">
                <Text className={PDP_SUBTITLE_CLASS}>Location: </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Change delivery location ${locationLine}`}
                  onPress={onPressChangePincode}
                  className="flex-row items-center active:opacity-80"
                >
                  <Text className="text-[13px] font-semibold text-pillfly-ink underline">
                    {locationLine}
                  </Text>
                  <Feather
                    accessible={false}
                    importantForAccessibility="no-hide-descendants"
                    name="chevron-right"
                    size={PDP_CHEVRON_SIZE}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View className={`${PDP_DIVIDER} ${PDP_ROW_PADDING} ${PDP_HORIZONTAL_PADDING}`}>
          <View className="flex-row items-center">
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              className={`${PDP_ICON_SLOT} mr-3`}
            >
              <Feather name="rotate-ccw" size={18} color={colors.primary} />
            </View>
            <Text className="flex-1 text-[14px] leading-[20px] text-pillfly-ink">
              {PRODUCT_RETURN_POLICY_DAYS} days return policy{" "}
              <Text
                accessibilityRole="link"
                onPress={onPressReturnPolicy}
                className="text-[14px] font-semibold text-pillfly-primary underline"
              >
                read more
              </Text>
            </Text>
          </View>
        </View>

        {showMedicineMeta ? (
          <>
            <LinkRow
              icon={<ProductDetailMoleculeIcon />}
              title="More Medicines with composition"
              subtitle={saltComposition}
              onPress={onPressComposition}
              titleClassName="text-[14px] font-semibold text-pillfly-ink"
              subtitleClassName={`mt-0.5 ${PDP_SUBTITLE_CLASS}`}
              borderClassName={PDP_DIVIDER}
              containerClassName={PDP_ROW_CONTAINER_CLASS}
              iconWrapperClassName="mr-3"
            />
            <LinkRow
              icon={<Ionicons name="leaf" size={20} color={colors.iconGreen} />}
              title="Therapeutic Classification"
              subtitle={therapeuticClass}
              onPress={onPressTherapeutic}
              titleClassName="text-[14px] font-semibold text-pillfly-ink"
              subtitleClassName={`mt-0.5 text-[12px] font-medium text-pillfly-muted`}
              borderClassName={PDP_DIVIDER}
              containerClassName={PDP_ROW_CONTAINER_CLASS}
              iconWrapperClassName="mr-3"
            />
          </>
        ) : null}
      </View>

      <ProductDetailPromoCarousel onPressPromoCta={onPressPromoCta} />
    </>
  );
});

ProductDetailMetaSections.displayName = "ProductDetailMetaSections";
