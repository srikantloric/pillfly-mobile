import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCartStore } from "@/features/cart/store/cart.store";
import { PrimaryButton } from "@/components/ui";
import { HEADER_HIT_SLOP } from "@/components/header/appHeader.constants";
import type { CartStackParamList } from "@/types/navigation.types";
import { colors } from "@/theme";
import { RequestError } from "@/services/api/requestError";

import {
  createCustomerAddress,
  getCustomerAddress,
  updateCustomerAddress,
} from "../api/address.api";
import { AddressField } from "../components/AddressField";
import { useAddressListStore } from "../store/addressList.store";
import { ADDRESS_LABELS, type AddressLabel } from "../types/address.types";
import {
  addressToFormValues,
  emptyAddressForm,
  toAddressInput,
  validateAddressForm,
  type AddressFormErrors,
  type AddressFormValues,
} from "../utils/addressForm";
import { addressLabelText } from "../utils/addressSelection";

type Props = NativeStackScreenProps<CartStackParamList, "AddressForm">;

export function AddressFormScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const addressId = route.params?.addressId;
  const isEdit = Boolean(addressId);
  const [values, setValues] = useState<AddressFormValues>(emptyAddressForm);
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const loadAddress = useCallback(async () => {
    if (!addressId) {
      return;
    }

    setLoadingAddress(true);
    setFormError(null);
    try {
      const address = await getCustomerAddress(addressId);
      setValues(addressToFormValues(address));
    } catch (error) {
      setFormError(error instanceof RequestError ? error.message : "Unable to load this address.");
    } finally {
      setLoadingAddress(false);
    }
  }, [addressId]);

  useEffect(() => {
    void loadAddress();
  }, [loadAddress]);

  const setField = (field: keyof AddressFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async () => {
    if (submitting) {
      return;
    }

    const nextErrors = validateAddressForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const input = toAddressInput(values);
      const saved = addressId
        ? await updateCustomerAddress(addressId, input)
        : await createCustomerAddress(input);
      useAddressListStore.getState().upsert(saved);
      const selected = useCartStore.getState().deliveryAddress;
      if (!addressId || selected?.id === saved.id) {
        useCartStore.getState().setDeliveryAddress(saved);
      }
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof RequestError ? error.message : "Unable to save this address.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-pillfly-background">
      <View
        className="flex-row items-center border-b border-pillfly-line bg-pillfly-surface px-2"
        style={{ paddingTop: insets.top + 4, paddingBottom: 12 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={HEADER_HIT_SLOP}
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center"
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text className="ml-1 text-[18px] font-bold text-pillfly-ink">
          {isEdit ? "Edit Address" : "Add Address"}
        </Text>
      </View>

      {loadingAddress ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <AddressField
            label="Name"
            value={values.recipientName}
            onChangeText={(value) => setField("recipientName", value)}
            error={errors.recipientName}
          />
          <AddressField
            label="Mobile Number"
            value={values.phoneNumber}
            onChangeText={(value) => setField("phoneNumber", value)}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phoneNumber}
          />
          <Text className="-mt-2 mb-4 text-[12px] text-pillfly-muted">
            For all delivery related communication
          </Text>
          <View className="flex-row gap-3">
            <View className="w-[140px]">
              <AddressField
                label="Pincode"
                value={values.postalCode}
                onChangeText={(value) => setField("postalCode", value.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                error={errors.postalCode}
              />
            </View>
            <View className="flex-1">
              <AddressField
                label="City"
                value={values.city}
                onChangeText={(value) => setField("city", value)}
                error={errors.city}
              />
            </View>
          </View>
          <AddressField
            label="State"
            value={values.state}
            onChangeText={(value) => setField("state", value)}
            error={errors.state}
          />
          <AddressField
            label="House number and building"
            value={values.addressLine1}
            onChangeText={(value) => setField("addressLine1", value)}
            error={errors.addressLine1}
          />
          <AddressField
            label="Street Name"
            value={values.addressLine2}
            onChangeText={(value) => setField("addressLine2", value)}
            optional
          />
          <AddressField
            label="Landmark"
            value={values.landmark}
            onChangeText={(value) => setField("landmark", value)}
            optional
          />

          <Text className="mb-3 text-[14px] font-semibold text-pillfly-ink">Address Type *</Text>
          <View className="mb-6 flex-row gap-3">
            {ADDRESS_LABELS.map((label) => {
              const selected = values.label === label;
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setField("label", label as AddressLabel)}
                  className={`rounded-full border px-4 py-2 ${
                    selected ? "border-pillfly-primary" : "border-pillfly-line"
                  }`}
                >
                  <Text className={`text-[14px] font-semibold ${selected ? "text-pillfly-primary" : "text-pillfly-ink"}`}>
                    {addressLabelText(label)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {formError ? <Text className="mb-3 text-[13px] text-pillfly-promo-red">{formError}</Text> : null}
          {isEdit && formError && !values.recipientName ? (
            <Pressable accessibilityRole="button" onPress={() => void loadAddress()} className="mb-3 self-start">
              <Text className="text-[14px] font-bold text-pillfly-primary">Retry</Text>
            </Pressable>
          ) : null}

          <PrimaryButton
            label={submitting ? "Saving..." : "Save and Continue"}
            disabled={submitting}
            accessibilityLabel="Save and continue"
            onPress={() => void onSubmit()}
          />
        </ScrollView>
      )}
    </View>
  );
}
