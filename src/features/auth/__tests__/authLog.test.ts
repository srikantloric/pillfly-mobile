import { redactAuthValue, resolveRequestUrl } from "../api/authLog";

describe("authLog", () => {
  it("redacts credentials and keeps the surrounding response shape", () => {
    expect(
      redactAuthValue({
        success: true,
        message: "OTP sent successfully",
        session: "cognito-session-token",
        accessToken: "access",
        idToken: "id",
        otp: "123456",
        challengeName: "CUSTOM_CHALLENGE",
        user: { id: "CUS_1", phoneNumber: "+919876543210", status: "ACTIVE" },
      }),
    ).toEqual({
      success: true,
      message: "OTP sent successfully",
      session: "[redacted 21 chars]",
      accessToken: "[redacted 6 chars]",
      idToken: "[redacted 2 chars]",
      otp: "[redacted 6 chars]",
      challengeName: "CUSTOM_CHALLENGE",
      user: { id: "CUS_1", phoneNumber: "+919876543210", status: "ACTIVE" },
    });
  });

  it("joins the auth base URL with a relative path", () => {
    expect(resolveRequestUrl("https://example.test/api/v1", "/auth/send-otp")).toBe(
      "https://example.test/api/v1/auth/send-otp",
    );
    expect(resolveRequestUrl("https://example.test/api/v1", "https://example.test/api/v1/customer/me")).toBe(
      "https://example.test/api/v1/customer/me",
    );
  });
});