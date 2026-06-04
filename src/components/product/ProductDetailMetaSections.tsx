import React, { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { IconTextRow, LinkRow } from "@/components/ui";
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

const PDP_ROW_CONTAINER_CLASS =
  "flex-row items-center bg-pillfly-surface px-4 py-3.5 active:bg-pillfly-background";

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

  const pinLabel = useMemo(() => {
    const { pincode, areaLabel } = MOCK_DELIVERY_INFO;
    return areaLabel ? `${pincode} ${areaLabel}` : pincode;
  }, []);

  return (
    <>
      <View className="bg-pillfly-surface">
        <View className="border-t border-pillfly-line bg-pillfly-surface">
          <IconTextRow
            icon={<Feather name="truck" size={20} color={colors.primary} />}
            rowClassName="flex-row items-center px-4 py-3.5"
            iconWrapperClassName="mr-3 h-8 w-8 items-center justify-center"
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Change delivery pincode ${MOCK_DELIVERY_INFO.pincode}`}
                onPress={onPressChangePincode}
                className="max-w-[42%] flex-row items-center gap-0.5 active:opacity-80"
              >
                <Text className="text-[13px] font-semibold text-pillfly-ink" numberOfLines={1}>
                  {pinLabel}
                </Text>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            }
          >
            <Text className="text-[14px] font-bold text-pillfly-ink">
              {MOCK_DELIVERY_INFO.etaLabel}
            </Text>
            {MOCK_DELIVERY_INFO.subtitle ? (
              <Text className="mt-0.5 text-[12px] text-pillfly-muted">
                {MOCK_DELIVERY_INFO.subtitle}
              </Text>
            ) : null}
          </IconTextRow>
        </View>

        <View className="border-t border-b border-pillfly-line bg-pillfly-surface">
          <IconTextRow
            icon={<Feather name="rotate-ccw" size={18} color={colors.textSecondary} />}
            rowClassName="flex-row items-center px-4 py-3.5"
            iconWrapperClassName="mr-3 h-8 w-8 items-center justify-center"
          >
            <Text className="flex-1 text-[14px] leading-[20px] text-pillfly-ink">
              {PRODUCT_RETURN_POLICY_DAYS} days return policy{" "}
              <Text
                accessibilityRole="link"
                onPress={onPressReturnPolicy}
                className="text-[14px] text-pillfly-ink underline"
              >
                read more
              </Text>
            </Text>
          </IconTextRow>
        </View>

        {showMedicineMeta ? (
          <>
            <View className="mx-4 border-b border-dashed border-pillfly-line" />
            <LinkRow
              icon={<ProductDetailMoleculeIcon />}
              title="More Medicines with composition"
              subtitle={saltComposition}
              onPress={onPressComposition}
              borderClassName=""
              containerClassName={PDP_ROW_CONTAINER_CLASS}
              iconWrapperClassName="mr-3"
            />
            <View className="mx-4 border-b border-pillfly-line" />
            <LinkRow
              icon={<Ionicons name="leaf" size={20} color={colors.iconGreen} />}
              title="Therapeutic classification"
              subtitle={therapeuticClass}
              onPress={onPressTherapeutic}
              titleClassName="text-[14px] font-semibold text-pillfly-ink"
              subtitleClassName="mt-0.5 text-[12px] font-medium uppercase tracking-wide text-pillfly-muted"
              borderClassName="border-b border-pillfly-line"
              containerClassName={PDP_ROW_CONTAINER_CLASS}
            />
          </>
        ) : null}
      </View>

      <ProductDetailPromoCarousel onPressPromoCta={onPressPromoCta} />
    </>
  );
});

ProductDetailMetaSections.displayName = "ProductDetailMetaSections";
