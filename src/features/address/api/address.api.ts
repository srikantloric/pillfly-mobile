import { authClient } from "@/services/api/auth.client";
import { RequestError, toRequestError } from "@/services/api/requestError";

import type { AddressInput, CustomerAddress } from "../types/address.types";
import {
  parseCustomerAddressListResponse,
  parseCustomerAddressResponse,
  parseDeleteAddressResponse,
  toAddressRequestBody,
} from "./address.parsers";
import { ADDRESS_PATHS } from "./address.paths";

const ADDRESS_STATUS_MESSAGES = {
  400: "Unable to save this address.",
  401: "Please sign in again.",
  404: "Address not found.",
};

async function request<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toRequestError(error, ADDRESS_STATUS_MESSAGES);
  }
}

function requireAddressId(addressId: string): string {
  const id = addressId.trim();
  if (!id) {
    throw new RequestError("Address not found.", { status: 400 });
  }

  return id;
}

export function listCustomerAddresses(): Promise<CustomerAddress[]> {
  return request(async () => {
    const response = await authClient.get<unknown>(ADDRESS_PATHS.collection);
    return parseCustomerAddressListResponse(response.data);
  });
}

export function getCustomerAddress(addressId: string): Promise<CustomerAddress> {
  return request(async () => {
    const response = await authClient.get<unknown>(ADDRESS_PATHS.byId(requireAddressId(addressId)));
    return parseCustomerAddressResponse(response.data);
  });
}

export function createCustomerAddress(input: AddressInput): Promise<CustomerAddress> {
  return request(async () => {
    const response = await authClient.post<unknown>(ADDRESS_PATHS.collection, toAddressRequestBody(input));
    return parseCustomerAddressResponse(response.data);
  });
}

export function updateCustomerAddress(
  addressId: string,
  input: AddressInput,
): Promise<CustomerAddress> {
  return request(async () => {
    const response = await authClient.put<unknown>(
      ADDRESS_PATHS.byId(requireAddressId(addressId)),
      toAddressRequestBody(input),
    );
    return parseCustomerAddressResponse(response.data);
  });
}

export function deleteCustomerAddress(addressId: string): Promise<void> {
  return request(async () => {
    const response = await authClient.delete<unknown>(ADDRESS_PATHS.byId(requireAddressId(addressId)));
    parseDeleteAddressResponse(response.data);
  });
}
