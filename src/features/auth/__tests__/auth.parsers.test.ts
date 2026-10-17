import {
  parseGetMeResponse,
  parseSendOtpResponse,
  parseTokenResponse,
} from "../api/auth.parsers";
import { RequestError } from "@/services/api/requestError";

describe("auth parsers", () => {
  it("parses send-otp session without inventing one", () => {
    expect(
      parseSendOtpResponse({
        success: true,
        message: "OTP sent successfully",
        session: "cognito-session-token",
        challengeName: "CUSTOM_CHALLENGE",
      }),
    ).toBe("cognito-session-token");
  });

  it("rejects send-otp payloads without a session", () => {
    expect(() => parseSendOtpResponse({ success: true, message: "OTP sent successfully" })).toThrow(
      RequestError,
    );
  });

  it("parses token responses down to the tokens", () => {
    expect(
      parseTokenResponse({
        success: true,
        accessToken: "access",
        idToken: "id",
        expiresIn: 3600,
        tokenType: "Bearer",
      }),
    ).toEqual({ accessToken: "access", idToken: "id" });
  });

  it("rejects token responses with a missing token", () => {
    expect(() => parseTokenResponse({ success: true, accessToken: "access" })).toThrow(RequestError);
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

    expect(parseGetMeResponse({ success: true, user })).toEqual({
      id: "CUS_123",
      phoneNumber: "+919876543210",
      name: "Priya Sharma",
      status: "ACTIVE",
    });
  });

  it("rejects customer profiles with an unknown status", () => {
    expect(() =>
      parseGetMeResponse({ success: true, user: { id: "CUS_1", phoneNumber: "+91", status: "GONE" } }),
    ).toThrow(RequestError);
  });
});
