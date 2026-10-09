import {
  parseGetMeResponse,
  parseSendOtpResponse,
  parseTokenResponse,
} from "../api/auth.parsers";
import { AuthRequestError } from "../utils/authRequestError";

describe("auth parsers", () => {
  it("parses send-otp session without inventing one", () => {
    expect(
      parseSendOtpResponse({
        success: true,
        message: "OTP sent successfully",
        session: "cognito-session-token",
        challengeName: "CUSTOM_CHALLENGE",
      }),
    ).toMatchObject({ session: "cognito-session-token" });
  });

  it("rejects send-otp payloads without a session", () => {
    expect(() => parseSendOtpResponse({ success: true, message: "OTP sent successfully" })).toThrow(
      AuthRequestError,
    );
  });

  it("parses token responses and keeps optional fields optional", () => {
    expect(
      parseTokenResponse({
        success: true,
        accessToken: "access",
        idToken: "id",
      }),
    ).toEqual({
      success: true,
      accessToken: "access",
      idToken: "id",
    });
  });

  it("parses customer profiles", () => {
    const user = {
      id: "CUS_123",
      phoneNumber: "+919876543210",
      name: "Priya Sharma",
      status: "ACTIVE",
      createdAt: "2026-08-26T10:00:00.000Z",
      updatedAt: "2026-08-26T10:00:00.000Z",
    };

    expect(parseGetMeResponse({ success: true, user })).toEqual({ success: true, user });
  });
});
