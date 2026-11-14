import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { Feather } from "@react-native-vector-icons/feather";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";

import { navigateToOrdersTab } from "@/navigation/navigateShared";
import { addressLabelText, addressSummaryLine } from "@/features/address/utils/addressSelection";
import { isCustomerAddress } from "@/features/address/types/address.types";
import { createCustomerOrder, verifyOrderPayment } from "@/features/order/api/order.api";
import { toOrderItems } from "@/features/order/utils/orderItems";
import {
  buildRazorpayOptions,
  razorpayErrorMessage,
  toRazorpayVerifyInput,
} from "@/features/order/utils/razorpayCheckout";
import type { CreateOrderResponse, VerifyPaymentResponse } from "@/features/order/types/order.types";
import { formatInr } from "@/features/product/utils/productDisplay";
import { colors } from "@/theme";

import { CartBillSummary, CartItemRow } from "../components";
import { useCartSummary } from "../hooks/useCartSummary";
import { useCartStore } from "../store/cart.store";

const MISSING_ITEM_MESSAGE = "Each item needs a product, variant, SKU, and a quantity of at least 1.";

export function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const items = useCartStore((state) => state.items);
  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  const selectedAddress = isCustomerAddress(deliveryAddress) ? deliveryAddress : null;
  const { resolvedLines, bill, isResolving, persistHydrated, hasPersistedItems, retryResolve } =
    useCartSummary();
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreateOrderResponse | null>(null);
  const [paid, setPaid] = useState<VerifyPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderItems = toOrderItems(items);
  const displayTotal = created?.order.totalAmount ?? bill?.amountToPay;
  const waiting = !persistHydrated || isResolving;
  const canPay =
    !submitting &&
    paid == null &&
    (created != null || (selectedAddress != null && orderItems != null && !waiting));

  useEffect(() => {
    if (!paid) {
      return;
    }

    useCartStore.setState({ items: [] });
  }, [paid]);

  const onContinue = useCallback(() => {
    const address = selectedAddress;
    const itemsForOrder = orderItems;
    if (submitting || paid || (!created && (!address || !itemsForOrder))) {
      return;
    }

    setSubmitting(true);
    setError(null);

    let placeOrder: Promise<CreateOrderResponse>;
    if (created) {
      placeOrder = Promise.resolve(created);
    } else if (address && itemsForOrder) {
      placeOrder = createCustomerOrder({
        addressId: address.id,
        items: itemsForOrder,
      }).then((result) => {
        setCreated(result);
        return result;
      });
    } else {
      setSubmitting(false);
      return;
    }

    placeOrder
      .then((order) => {
        const options = buildRazorpayOptions(
          order.payment,
          address
            ? { name: address.recipientName, contact: address.phoneNumber }
            : undefined,
        );
        if (!options) {
          throw new Error("Payment is not configured.");
        }

        return RazorpayCheckout.open(options).then((data) => ({ order, data }));
      })
      .then(({ order, data }) => {
        const input = toRazorpayVerifyInput(data);
        if (!input) {
          throw new Error("Payment details are incomplete.");
        }

        return verifyOrderPayment(order.order.id, input);
      })
      .then((result) => {
        setPaid(result);
      })
      .catch((caught: unknown) => {
        setError(razorpayErrorMessage(caught));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [created, orderItems, paid, selectedAddress, submitting]);

  if (paid) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-pillfly-background px-8" edges={["bottom"]}>
        <Text className="text-center text-[18px] font-bold text-pillfly-ink">Payment confirmed</Text>
        <Text className="mt-2 text-center text-[14px] text-pillfly-muted">Order {paid.order.id}</Text>
        <Text className="mt-2 text-[20px] font-bold text-pillfly-ink">
          {formatInr(paid.order.totalAmount)}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigateToOrdersTab(navigation, {
              screen: "OrderDetail",
              params: { orderId: paid.order.id },
            })
          }
          className="mt-6 rounded-xl bg-pillfly-primary px-5 py-3.5 active:opacity-90"
        >
          <Text className="text-[14px] font-bold text-white">View order</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!persistHydrated || (hasPersistedItems && resolvedLines.length === 0 && isResolving)) {
    return (
      <View className="flex-1 items-center justify-center bg-pillfly-background px-8">
        <Text className="text-[18px] font-bold text-pillfly-ink">Loading checkout</Text>
      </View>
    );
  }

  if (resolvedLines.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-pillfly-background px-8">
        <Text className="text-center text-[18px] font-bold text-pillfly-ink">
          {hasPersistedItems ? "Unable to load cart items" : "Your cart is empty"}
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
    );
  }

  const buttonLabel = submitting && !created ? "Creating order..." : "Continue to Pay";

  return (
    <SafeAreaView className="flex-1 bg-pillfly-background" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {selectedAddress ? (
          <View className="mx-4 mt-4 flex-row items-center gap-3 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-3">
            <Feather name="map-pin" size={18} color={colors.primary} />
            <View className="min-w-0 flex-1">
              <Text className="text-[14px] font-bold text-pillfly-ink" numberOfLines={1}>
                Deliver to {addressLabelText(selectedAddress.label)} ({selectedAddress.postalCode})
              </Text>
              <Text className="mt-0.5 text-[12px] text-pillfly-muted" numberOfLines={2}>
                {addressSummaryLine(selectedAddress)}
              </Text>
            </View>
          </View>
        ) : (
          <Text className="mx-4 mt-4 text-[14px] text-pillfly-muted">
            Add a delivery address from the cart before placing the order.
          </Text>
        )}

        <View className="mx-4 mt-4 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
          {resolvedLines.map((line) => (
            <CartItemRow key={`${line.productId}:${line.variantId ?? ""}`} line={line} />
          ))}
        </View>

        {created ? (
          <View className="mx-4 mt-4 mb-4 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
            <View className="border-b border-dashed border-pillfly-line px-4 py-3">
              <Text className="text-[15px] font-bold text-pillfly-ink">Bill Summary</Text>
            </View>
            <View className="px-4 py-2">
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-[14px] text-pillfly-muted">Subtotal</Text>
                <Text className="text-[14px] font-semibold text-pillfly-ink">
                  {formatInr(created.order.subtotal)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-[14px] font-bold text-pillfly-ink">Amount to be paid</Text>
                <Text className="text-[14px] font-bold text-pillfly-ink">
                  {formatInr(created.order.totalAmount)}
                </Text>
              </View>
            </View>
          </View>
        ) : bill ? (
          <View className="mb-4">
            <CartBillSummary bill={bill} />
          </View>
        ) : null}

        {!waiting && orderItems == null ? (
          <Text className="mx-4 mb-4 text-[13px] text-pillfly-ink">{MISSING_ITEM_MESSAGE}</Text>
        ) : null}
        {error ? <Text className="mx-4 mb-4 text-[13px] text-pillfly-ink">{error}</Text> : null}
      </ScrollView>

      <View className="flex-row items-center justify-between border-t border-pillfly-line bg-pillfly-surface px-4 py-3">
        <Text className="text-[20px] font-bold text-pillfly-ink">
          {displayTotal != null ? formatInr(displayTotal) : ""}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          disabled={!canPay}
          onPress={onContinue}
          className={`min-w-[190px] flex-row items-center justify-center rounded-xl bg-pillfly-primary px-4 py-3.5 ${
            canPay ? "active:opacity-90" : "opacity-60"
          }`}
        >
          <Text className="text-[14px] font-bold text-white">{buttonLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
