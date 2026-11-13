import type { CustomerAddress } from "../types/address.types";
import { resolveSelectedAddress } from "../utils/addressSelection";

const home = {
  id: "home",
  label: "HOME",
  recipientName: "Cx",
  phoneNumber: "+919876543210",
  addressLine1: "N0061",
  city: "Bhara",
  state: "West Bengal",
  postalCode: "722157",
  countryCode: "IN",
  createdAt: "2026-11-01T13:44:49.383Z",
  updatedAt: "2026-11-01T13:44:49.383Z",
} satisfies CustomerAddress;

const work = {
  ...home,
  id: "work",
  label: "WORK" as const,
  recipientName: "Purna",
  updatedAt: "2026-11-01T14:00:00.000Z",
};

describe("resolveSelectedAddress", () => {
  it("keeps the selected address when another address is removed from the list", () => {
    expect(resolveSelectedAddress(home, [home])).toEqual(home);
  });

  it("clears the selection when that address is no longer in the list", () => {
    expect(resolveSelectedAddress(home, [work])).toBeNull();
  });

  it("replaces the selected address with the updated list copy", () => {
    const updated = { ...home, recipientName: "salin", updatedAt: "2026-11-01T14:51:47.161Z" };

    expect(resolveSelectedAddress(home, [updated, work])).toEqual(updated);
  });
});
