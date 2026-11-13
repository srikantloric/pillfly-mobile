import { RequestError } from "@/services/api/requestError";

import {
  isAddressLabel,
  type AddressInput,
  type CustomerAddress,
} from "../types/address.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalString(value: unknown): string | undefined | null {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function malformed(): RequestError {
  return new RequestError("Unexpected response from server.", { kind: "malformed" });
}

export function parseCustomerAddress(value: unknown): CustomerAddress | null {
  if (!isRecord(value) || !isAddressLabel(value.label)) {
    return null;
  }

  const id = requiredString(value.id);
  const recipientName = requiredString(value.recipientName);
  const phoneNumber = requiredString(value.phoneNumber);
  const addressLine1 = requiredString(value.addressLine1);
  const addressLine2 = optionalString(value.addressLine2);
  const landmark = optionalString(value.landmark);
  const city = requiredString(value.city);
  const state = requiredString(value.state);
  const postalCode = requiredString(value.postalCode);
  const countryCode = requiredString(value.countryCode);
  const createdAt = requiredString(value.createdAt);
  const updatedAt = requiredString(value.updatedAt);

  if (
    !id ||
    !recipientName ||
    !phoneNumber ||
    !addressLine1 ||
    addressLine2 === null ||
    landmark === null ||
    !city ||
    !state ||
    !postalCode ||
    !countryCode ||
    !createdAt ||
    !updatedAt
  ) {
    return null;
  }

  return {
    id,
    label: value.label,
    recipientName,
    phoneNumber,
    addressLine1,
    ...(addressLine2 ? { addressLine2 } : {}),
    ...(landmark ? { landmark } : {}),
    city,
    state,
    postalCode,
    countryCode,
    createdAt,
    updatedAt,
  };
}

export function parseCustomerAddressResponse(data: unknown): CustomerAddress {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }

  const address = parseCustomerAddress(data.data);
  if (!address) {
    throw malformed();
  }

  return address;
}

export function parseCustomerAddressListResponse(data: unknown): CustomerAddress[] {
  if (!isRecord(data) || data.success !== true || !Array.isArray(data.data)) {
    throw malformed();
  }

  return data.data
    .map((item) => parseCustomerAddress(item))
    .filter((item): item is CustomerAddress => item != null);
}

export function parseDeleteAddressResponse(data: unknown): string {
  if (!isRecord(data) || data.success !== true || typeof data.message !== "string") {
    throw malformed();
  }

  const message = data.message.trim();
  if (!message) {
    throw malformed();
  }

  return message;
}

export function toAddressRequestBody(input: AddressInput): AddressInput {
  const body: AddressInput = {
    label: input.label,
    recipientName: input.recipientName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    addressLine1: input.addressLine1.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    postalCode: input.postalCode.trim(),
  };

  const addressLine2 = input.addressLine2?.trim();
  const landmark = input.landmark?.trim();
  if (addressLine2) {
    body.addressLine2 = addressLine2;
  }
  if (landmark) {
    body.landmark = landmark;
  }

  return body;
}
