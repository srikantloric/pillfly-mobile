export const ADDRESS_LABELS = ["HOME", "WORK", "OTHER"] as const;

export type AddressLabel = (typeof ADDRESS_LABELS)[number];

export type CustomerAddress = {
  id: string;
  label: AddressLabel;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  createdAt: string;
  updatedAt: string;
};

export type AddressInput = {
  label: AddressLabel;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
};

export function isAddressLabel(value: unknown): value is AddressLabel {
  return value === "HOME" || value === "WORK" || value === "OTHER";
}

export function isCustomerAddress(value: unknown): value is CustomerAddress {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    isAddressLabel(record.label) &&
    typeof record.recipientName === "string" &&
    typeof record.phoneNumber === "string" &&
    typeof record.addressLine1 === "string" &&
    typeof record.city === "string" &&
    typeof record.state === "string" &&
    typeof record.postalCode === "string" &&
    typeof record.countryCode === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}
