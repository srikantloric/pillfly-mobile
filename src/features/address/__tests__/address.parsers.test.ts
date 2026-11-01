import { parseCustomerAddressListResponse, parseCustomerAddressResponse, parseDeleteAddressResponse } from "../api/address.parsers";
import { RequestError } from "@/services/api/requestError";

const address = {
  id: "ADDRFPZZT41Y",
  label: "HOME",
  recipientName: "pkarmakar",
  phoneNumber: "+919876543210",
  addressLine1: "Main Road",
  addressLine2: "Near court",
  landmark: "alan park",
  city: "Kolkata",
  state: "West Bengal",
  postalCode: "700001",
  countryCode: "IN",
  createdAt: "2026-11-01T13:44:49.383Z",
  updatedAt: "2026-11-01T13:44:49.383Z",
};

describe("address parsers", () => {
  it("parses a created address from data", () => {
    expect(parseCustomerAddressResponse({ success: true, data: address })).toEqual(address);
  });

  it("parses multiple addresses and skips a broken item", () => {
    const second = { ...address, id: "ADDR2", recipientName: "Purna" };

    expect(
      parseCustomerAddressListResponse({
        success: true,
        data: [address, { id: "bad" }, second],
      }).map((item) => item.id),
    ).toEqual(["ADDRFPZZT41Y", "ADDR2"]);
  });

  it("rejects a list response that is not a successful array", () => {
    expect(() => parseCustomerAddressListResponse({ success: false, data: [] })).toThrow(RequestError);
    expect(() => parseCustomerAddressListResponse({ success: true, data: null })).toThrow(RequestError);
  });

  it("parses a delete acknowledgement", () => {
    expect(parseDeleteAddressResponse({ success: true, message: "Address deleted successfully" })).toBe(
      "Address deleted successfully",
    );
  });
});
