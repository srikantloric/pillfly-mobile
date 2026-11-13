import React, { useCallback, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect, type NavigationProp, type ParamListBase } from "@react-navigation/native";

import { getAccessToken } from "@/features/auth/api/authSession";

import { navigateToSharedRoute } from "@/navigation/navigateShared";
import type { CartStackParamList } from "@/types/navigation.types";
import { AddressPickerSheet } from "@/features/address/components/AddressPickerSheet";
import { SelectedAddressBar } from "@/features/address/components/SelectedAddressBar";
import { deleteCustomerAddress } from "@/features/address/api/address.api";
import { useAddressListStore } from "@/features/address/store/addressList.store";
import { isCustomerAddress, type CustomerAddress } from "@/features/address/types/address.types";
import { toCustomerMessage } from "@/utils/customerMessage";

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
const SELECTED_ADDRESS_SCROLL_PADDING = 188;

type Props = NativeStackScreenProps<CartStackParamList, "CartMain">;

export function CartScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const billOffsetRef = useRef(0);

  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  const selectedAddress = isCustomerAddress(deliveryAddress) ? deliveryAddress : null;
  const listStatus = useAddressListStore((state) => state.status);
  const addresses = useAddressListStore((state) => state.addresses);
  const listError = useAddressListStore((state) => state.error);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      if (useAddressListStore.getState().status === "idle" && getAccessToken()) {
        useAddressListStore.getState().load().catch(() => undefined);
      }
    }, []),
  );

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

  const savedAddressesReady = listStatus === "ready" && addresses.length > 0;
  const noSavedAddresses = listStatus === "ready" && addresses.length === 0;
  const waitingForAddresses = !selectedAddress && (listStatus === "idle" || listStatus === "loading");
  const primaryLabel = selectedAddress
    ? "Proceed To Buy"
    : savedAddressesReady
      ? "Select Address"
      : waitingForAddresses
        ? "Loading addresses..."
        : listStatus === "error"
          ? "Select Address"
          : "Add Delivery Address";

  const onPressPrimary = useCallback(() => {
    if (selectedAddress) {
      navigation.navigate("Checkout");
      return;
    }

    if (listStatus !== "ready") {
      return;
    }

    if (addresses.length > 0) {
      setPickerOpen(true);
      return;
    }

    navigation.navigate("AddressForm");
  }, [addresses.length, listStatus, navigation, selectedAddress]);

  const onSelectAddress = useCallback((address: CustomerAddress) => {
    useCartStore.getState().setDeliveryAddress(address);
    setPickerOpen(false);
  }, []);

  const onDeleteAddress = useCallback((address: CustomerAddress) => {
    if (deletingId) {
      return;
    }

    setDeletingId(address.id);
    void deleteCustomerAddress(address.id)
      .then(() => {
        useAddressListStore.getState().remove(address.id);
        if (useCartStore.getState().deliveryAddress?.id === address.id) {
          useCartStore.getState().setDeliveryAddress(null);
        }
      })
      .catch((error: unknown) => {
        Alert.alert(
          "Unable to delete address",
          toCustomerMessage(error),
        );
      })
      .finally(() => {
        setDeletingId(undefined);
      });
  }, [deletingId]);

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
        contentContainerStyle={{
          paddingBottom: selectedAddress ? SELECTED_ADDRESS_SCROLL_PADDING : CART_FOOTER_SCROLL_PADDING,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mx-4 mt-4 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
          {resolvedLines.map((line) => (
            <CartItemRow
              key={`${line.productId}:${line.variantId ?? ""}`}
              line={line}
              onRemove={removeFromCart}
            />
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
        <View className="absolute bottom-0 left-0 right-0 bg-pillfly-surface">
          {selectedAddress ? (
            <SelectedAddressBar address={selectedAddress} onPressChange={() => setPickerOpen(true)} />
          ) : null}
          {listStatus === "error" ? (
            <View className="flex-row items-center justify-between gap-3 border-t border-pillfly-line px-4 py-3">
              <Text className="flex-1 text-[13px] text-pillfly-ink">
                {listError ?? "Unable to load addresses."}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry loading addresses"
                onPress={() => void useAddressListStore.getState().retry()}
              >
                <Text className="text-[14px] font-bold text-pillfly-primary">Retry</Text>
              </Pressable>
            </View>
          ) : null}
          <CartFooter
            totalAmount={bill.amountToPay}
            primaryLabel={primaryLabel}
            primaryDisabled={!selectedAddress && !savedAddressesReady && !noSavedAddresses}
            onPressViewBill={onPressViewBill}
            onPressPrimary={onPressPrimary}
          />
        </View>
      ) : null}

      <AddressPickerSheet
        visible={pickerOpen}
        addresses={addresses}
        status={listStatus}
        error={listError}
        selectedId={selectedAddress?.id}
        deletingId={deletingId}
        onClose={() => setPickerOpen(false)}
        onRetry={() => void useAddressListStore.getState().retry()}
        onAdd={() => {
          setPickerOpen(false);
          navigation.navigate("AddressForm");
        }}
        onSelect={onSelectAddress}
        onEdit={(address) => {
          setPickerOpen(false);
          navigation.navigate("AddressForm", { addressId: address.id });
        }}
        onDelete={onDeleteAddress}
      />
    </View>
  );
}
