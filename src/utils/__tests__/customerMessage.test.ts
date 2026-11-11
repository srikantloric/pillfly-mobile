import { RequestError } from "@/services/api/requestError";

import { toCustomerMessage } from "../customerMessage";

const GENERIC = "Something went wrong. Please try again.";
const VALIDATION = "Please check your information and try again.";
const PRODUCT = "This product is currently unavailable.";
const ORDER = "We couldn't find this order.";
const ADDRESS = "We couldn't find this address.";
const SESSION = "Your session has expired. Please log in again.";
const NETWORK = "Please check your internet connection.";
const SERVER = "We're having trouble connecting. Please try again later.";

describe("toCustomerMessage", () => {
  it("replaces the known technical messages", () => {
    expect(toCustomerMessage(new RequestError("Unexpected response from server.", { kind: "malformed" }))).toBe(GENERIC);
    expect(toCustomerMessage(new RequestError("Validation failed", { status: 400 }))).toBe(VALIDATION);
    expect(toCustomerMessage(new Error("Product not found: prod_123"))).toBe(PRODUCT);
    expect(toCustomerMessage(new RequestError("Unauthorized", { status: 401 }))).toBe(SESSION);
    expect(toCustomerMessage(new RequestError("Please sign in again.", { status: 401 }))).toBe(SESSION);
    expect(
      toCustomerMessage(new RequestError("Network error. Check your connection and try again.", { kind: "network" })),
    ).toBe(NETWORK);
    expect(toCustomerMessage(new RequestError(GENERIC, { status: 500 }))).toBe(SERVER);
  });

  it("reads a nested API message before the HTTP status text", () => {
    expect(
      toCustomerMessage({
        message: "Request failed with status code 400",
        response: {
          status: 400,
          data: { error: { message: "Validation failed" }, data: { ignored: true } },
        },
      }),
    ).toBe(VALIDATION);

    expect(
      toCustomerMessage({
        message: "Request failed with status code 404",
        response: {
          status: 404,
          data: { data: { message: "Product not found: prod_12345678901234567890" } },
        },
      }),
    ).toBe(PRODUCT);

    expect(
      toCustomerMessage({
        response: {
          status: 400,
          data: {
            message: '{"error":{"message":"Order not found: ord_12345678901234567890"}}',
          },
        },
      }),
    ).toBe(ORDER);
  });

  it("maps HTTP status errors when the body has no safe sentence", () => {
    expect(toCustomerMessage({ message: "Request failed with status code 401", response: { status: 401, data: {} } })).toBe(
      SESSION,
    );
    expect(toCustomerMessage({ message: "Request failed with status code 404", response: { status: 404, data: {} } })).toBe(
      GENERIC,
    );
    expect(toCustomerMessage({ message: "Request failed with status code 500", response: { status: 500, data: {} } })).toBe(
      SERVER,
    );
    expect(toCustomerMessage(new RequestError("Address not found.", { status: 404 }))).toBe(ADDRESS);
  });

  it("maps a network failure that has no response body", () => {
    expect(toCustomerMessage({ message: "Network Error", request: {} })).toBe(NETWORK);
    expect(toCustomerMessage(new RequestError("Network error", { kind: "network" }))).toBe(NETWORK);
  });

  it("hides messages that contain an internal id", () => {
    expect(
      toCustomerMessage(new RequestError("Insufficient stock for wcfiT-LpmJ80v9_JIofXt. Available: 2", { status: 400 })),
    ).toBe(GENERIC);
    expect(toCustomerMessage(new RequestError("Insufficient stock for var_15. Available: 2", { status: 400 }))).toBe(
      GENERIC,
    );
    expect(toCustomerMessage(new RequestError("Unable to add prod_123 to the cart.", { status: 400 }))).toBe(GENERIC);
    expect(toCustomerMessage(new RequestError("Payment failed for PRD123", { status: 400 }))).toBe(GENERIC);
    expect(toCustomerMessage(new RequestError("Could not cancel ORD456", { status: 400 }))).toBe(GENERIC);
    expect(toCustomerMessage(new Error("Failed for 6f1c3a90-1b2c-4d5e-8f70-123456789abc"))).toBe(GENERIC);
    expect(toCustomerMessage("See https://api.example.com/orders/ord_123")).toBe(GENERIC);
  });

  it("keeps a useful backend sentence, including on a server error", () => {
    expect(toCustomerMessage(new RequestError("Unable to save this address.", { status: 400 }))).toBe(
      "Unable to save this address.",
    );
    expect(toCustomerMessage(new RequestError("Only 2 are available for an item in your cart.", { status: 400 }))).toBe(
      "Only 2 are available for an item in your cart.",
    );
    expect(toCustomerMessage(new RequestError("Amount to be paid is 94.00", { status: 400 }))).toBe(
      "Amount to be paid is 94.00",
    );
    expect(toCustomerMessage(new RequestError("The pharmacy is closed today.", { status: 500 }))).toBe(
      "The pharmacy is closed today.",
    );
    expect(toCustomerMessage(new RequestError("Invalid or expired OTP", { status: 401 }))).toBe(
      "Invalid or expired OTP",
    );
  });

  it("uses the same sentences the product, order, and address screens display", () => {
    expect(toCustomerMessage(new Error("Product not found: prod_detail"))).toBe(PRODUCT);
    expect(toCustomerMessage(new Error("Failed to load product"))).toBe(GENERIC);
    expect(toCustomerMessage(new Error("Failed to load products"))).toBe(GENERIC);
    expect(toCustomerMessage(new Error("Failed to search products"))).toBe(GENERIC);
    expect(toCustomerMessage(new RequestError("Order not found.", { status: 404 }))).toBe(ORDER);
    expect(toCustomerMessage(new RequestError("Unable to delete this address.", { status: 400 }))).toBe(
      "Unable to delete this address.",
    );
  });
});
