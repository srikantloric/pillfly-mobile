import type { CustomerAddress } from "../types/address.types";

export function resolveSelectedAddress(
  selected: CustomerAddress | null,
  addresses: readonly CustomerAddress[],
): CustomerAddress | null {
  if (!selected) {
    return null;
  }

  return addresses.find((address) => address.id === selected.id) ?? null;
}

export function addressLabelText(label: CustomerAddress["label"]): string {
  if (label === "HOME") {
    return "Home";
  }
  if (label === "WORK") {
    return "Work";
  }
  return "Others";
}

export function addressSummaryLine(address: CustomerAddress): string {
  return [address.addressLine1, address.addressLine2, address.city, address.state]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(", ");
}
