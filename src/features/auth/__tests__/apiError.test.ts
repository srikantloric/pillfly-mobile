import { getApiErrorMessage, isApiError, messageForHttpStatus } from "../utils/apiError";

describe("apiError", () => {
  it("recognizes documented API errors", () => {
    expect(isApiError({ success: false, message: "Invalid or expired OTP" })).toBe(true);
    expect(isApiError({ success: true, message: "ok" })).toBe(false);
    expect(isApiError({ success: false, message: "" })).toBe(false);
  });

  it("extracts API messages without exposing unknown shapes", () => {
    expect(getApiErrorMessage({ success: false, message: "Unauthorized" })).toBe("Unauthorized");
    expect(getApiErrorMessage(null)).toBe("Something went wrong. Please try again.");
  });

  it("maps HTTP statuses to user-facing copy", () => {
    expect(messageForHttpStatus(401)).toBe("Session expired. Please login again.");
    expect(messageForHttpStatus(403)).toBe("This account cannot be used.");
    expect(messageForHttpStatus(404)).toBe("Customer profile not found.");
  });
});
