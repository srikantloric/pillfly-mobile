import React, { useCallback, useRef } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";

import { navigateToSharedRoute } from "@/navigation/navigateShared";
import type { CartStackParamList } from "@/types/navigation.types";

import {
  AddMoreItemsRow,
  CartBillSummary,
  CartFooter,
  CartHeader,
  CartItemRow,
} from "../components";

import { useCartActions } from "../hooks/useCartActions";
import { useCartSummary } from "../hooks/useCartSummary";
import { useCartStore } from "../store/cart.store";

const CART_FOOTER_SCROLL_PADDING = 112;

type Props = NativeStackScreenProps<CartStackParamList, "CartMain">;

export function CartScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const billOffsetRef = useRef(0);

  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  console.log('deliveryAddress', deliveryAddress);

  const { removeFromCart } = useCartActions();
  const { resolvedLines, bill, hasPersistedItems, isResolving, persistHydrated, retryResolve } =
    useCartSummary();

  const onPressBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const onPressSearch = useCallback(() => {
    const parent = navigation.getParent<NavigationProp<ParamListBase>>();
    navigateToSharedRoute(parent ?? navigation, "Search");
  }, [navigation]);

  const onPressSaveForLater = useCallback(() => {
    Alert.alert("Coming soon", "Save for later will be available soon.");
  }, []);

  const onPressAddMore = useCallback(() => {
    const parent = navigation.getParent<NavigationProp<ParamListBase>>();
    navigateToSharedRoute(parent ?? navigation, "Search");
  }, [navigation]);

  const onPressViewBill = useCallback(() => {
    scrollRef.current?.scrollTo({ y: Math.max(0, billOffsetRef.current - 12), animated: true });
  }, []);

  const onPressPrimary = useCallback(() => {
    if (!deliveryAddress) {
      Alert.alert("Coming soon", "Delivery address selection will be available soon.");
      return;
    }
    navigation.navigate("Checkout");
  }, [deliveryAddress, navigation]);

  const onBillLayout = useCallback((y: number) => {
    billOffsetRef.current = y;
  }, []);

  if (!persistHydrated || (hasPersistedItems && resolvedLines.length === 0 && isResolving)) {
    return (
      <View className="flex-1 bg-pillfly-background">
        <CartHeader
          onPressBack={onPressBack}
          onPressSearch={onPressSearch}
          onPressSaveForLater={onPressSaveForLater}
        />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[18px] font-bold text-pillfly-ink">Loading cart</Text>
          <Text className="mt-2 text-center text-[14px] text-pillfly-muted">
            Restoring your items and current prices.
          </Text>
        </View>
      </View>
    );
  }

  if (resolvedLines.length === 0) {
    return (
      <View className="flex-1 bg-pillfly-background">
        <CartHeader
          onPressBack={onPressBack}
          onPressSearch={onPressSearch}
          onPressSaveForLater={onPressSaveForLater}
        />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[18px] font-bold text-pillfly-ink">
            {hasPersistedItems ? "Unable to load cart items" : "Your cart is empty"}
          </Text>
          <Text className="mt-2 text-center text-[14px] text-pillfly-muted">
            {hasPersistedItems
              ? "Check your connection and try again."
              : "Add items from search or product pages to see them here."}
          </Text>
          {hasPersistedItems ? (
            <Pressable
              accessibilityRole="button"
              onPress={retryResolve}
              className="mt-4 rounded-xl bg-pillfly-primary px-5 py-3 active:opacity-90"
            >
              <Text className="text-[15px] font-bold text-white">Retry</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-pillfly-background">
      <CartHeader
        onPressBack={onPressBack}
        onPressSearch={onPressSearch}
        onPressSaveForLater={onPressSaveForLater}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: CART_FOOTER_SCROLL_PADDING }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mx-4 mt-4 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
          {resolvedLines.map((line) => (
            <CartItemRow key={line.productId} line={line} onRemove={removeFromCart} />
          ))}
        </View>

        <AddMoreItemsRow onPress={onPressAddMore} />

        {bill ? (
          <View onLayout={(event) => onBillLayout(event.nativeEvent.layout.y)}>
            <CartBillSummary bill={bill} />
          </View>
        ) : null}
      </ScrollView>

      {bill ? (
        <CartFooter
          totalAmount={bill.amountToPay}
          hasDeliveryAddress={deliveryAddress != null}
          onPressViewBill={onPressViewBill}
          onPressPrimary={onPressPrimary}
        />
      ) : null}
    </View>
  );
}
