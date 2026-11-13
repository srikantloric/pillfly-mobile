import { normalizeIndianMobile } from "@/features/auth/utils/phoneValidation";

import type { AddressInput, AddressLabel, CustomerAddress } from "../types/address.types";

export type AddressFormValues = {
  label: AddressLabel;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
};

export type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>;

export function emptyAddressForm(): AddressFormValues {
  return {
    label: "HOME",
    recipientName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
  };
}

export function addressToFormValues(address: CustomerAddress): AddressFormValues {
  const phone = normalizeIndianMobile(address.phoneNumber);

  return {
    label: address.label,
    recipientName: address.recipientName,
    phoneNumber: phone.ok ? phone.mobile : address.phoneNumber,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    landmark: address.landmark ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
  };
}

export function validateAddressForm(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {};
  const phone = normalizeIndianMobile(values.phoneNumber);

  if (!values.recipientName.trim()) {
    errors.recipientName = "Enter the recipient name.";
  }
  if (!phone.ok) {
    errors.phoneNumber = "Enter a valid 10-digit mobile number.";
  }
  if (!/^\d{6}$/.test(values.postalCode.trim())) {
    errors.postalCode = "Enter a 6-digit pincode.";
  }
  if (!values.city.trim()) {
    errors.city = "Enter the city.";
  }
  if (!values.state.trim()) {
    errors.state = "Enter the state.";
  }
  if (!values.addressLine1.trim()) {
    errors.addressLine1 = "Enter the house number and building.";
  }

  return errors;
}

export function toAddressInput(values: AddressFormValues): AddressInput {
  const phone = normalizeIndianMobile(values.phoneNumber);
  return {
    label: values.label,
    recipientName: values.recipientName.trim(),
    phoneNumber: phone.ok ? phone.mobile : values.phoneNumber.trim(),
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2,
    landmark: values.landmark,
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
  };
}
