import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Scroll content padding below the bar (excludes safe-area inset). Matches SearchResults. */
export const CART_STICKY_BAR_SCROLL_PADDING = 88;

type Props = {
  itemCount: number;
  label?: string;
  onPressViewCart: () => void;
};

export const CartStickyBar = memo(function CartStickyBar({
  itemCount,
  label = "In cart",
  onPressViewCart,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-20 flex-row items-center justify-between border-t border-pillfly-line bg-pillfly-surface px-4 py-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View>
        <Text className="text-[14px] font-bold text-pillfly-ink">{itemCount} items</Text>
        <Text className="text-[12px] text-pillfly-muted">{label}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View cart"
        onPress={onPressViewCart}
        className="flex-row items-center gap-2 rounded-xl bg-pillfly-primary px-5 py-3 active:opacity-90"
      >
        <Text className="text-[15px] font-bold text-white">View Cart</Text>
        <Feather name="shopping-cart" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
});

CartStickyBar.displayName = "CartStickyBar";
