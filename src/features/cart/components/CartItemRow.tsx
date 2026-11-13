import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { ProductImageWithPlaceholder } from "@/components/ui";
import { formatInr } from "@/features/product/utils/productDisplay";
import { colors } from "@/theme";

import type { ResolvedCartLine } from "../types/cart.types";

type Props = {
  line: ResolvedCartLine;
  onRemove?: (productId: string, variantId?: string) => void;
  onPressQuantity?: (line: ResolvedCartLine) => void;
};

export const CartItemRow = memo(function CartItemRow({
  line,
  onRemove,
  onPressQuantity,
}: Props) {
  const showStrike = line.mrp > line.salePrice;

  return (
    <View className="border-b border-pillfly-line px-4 py-4">
      <View className="flex-row gap-3">
        <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-lg border border-pillfly-line bg-pillfly-surface">
          <ProductImageWithPlaceholder uri={line.imageUrl} className="h-full w-full" />
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-[14px] font-bold leading-5 text-pillfly-ink" numberOfLines={2}>
              {line.title}
            </Text>
            {onRemove ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${line.title} from cart`}
                onPress={() => onRemove(line.productId, line.variantId)}
                className="h-8 w-8 items-center justify-center"
              >
                <Feather name="trash-2" size={18} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          {line.subtitle ? (
            <Text className="mt-1 text-[12px] text-pillfly-muted" numberOfLines={1}>
              {line.subtitle}
            </Text>
          ) : null}

          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-[15px] font-bold text-pillfly-ink">
                {formatInr(line.salePrice)}
              </Text>
              {showStrike ? (
                <Text className="text-[12px] text-pillfly-muted line-through">
                  {formatInr(line.mrp)}
                </Text>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Change quantity for ${line.title}, currently ${line.quantity}`}
              disabled={!onPressQuantity}
              onPress={() => onPressQuantity?.(line)}
              className="flex-row items-center gap-1 rounded-lg border border-pillfly-line px-3 py-1.5 active:opacity-80"
            >
              <Text className="text-[13px] font-semibold text-pillfly-ink">Qty {line.quantity}</Text>
              <Feather name="chevron-down" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

CartItemRow.displayName = "CartItemRow";
