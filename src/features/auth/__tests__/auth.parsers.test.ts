import {
  applyRefreshUpdate,
  parseGetMeResponse,
  parseRefreshResponse,
  parseResendOtpResponse,
  parseSendOtpResponse,
  parseVerifyOtpResponse,
} from "../api/auth.parsers";
import { RequestError } from "@/services/api/requestError";

const stored = {
  accessToken: "old-access",
  refreshToken: "old-refresh",
  idToken: "old-id",
};

describe("auth parsers", () => {
  it("reads the send-otp session only from data", () => {
    expect(
      parseSendOtpResponse({
        success: true,
        data: {
          message: "OTP sent successfully",
          session: "cognito-session-token",
          challengeName: "CUSTOM_CHALLENGE",
        },
      }),
    ).toBe("cognito-session-token");
  });

  it("rejects a send-otp session that is missing or only present at the root", () => {
    expect(() => parseSendOtpResponse({ success: true, data: { message: "OTP sent successfully" } })).toThrow(
      RequestError,
    );
    expect(() =>
      parseSendOtpResponse({ success: true, session: "root-session", data: { message: "OTP sent" } }),
    ).toThrow(RequestError);
    expect(() => parseSendOtpResponse({ success: true, data: { message: "OTP sent", session: "  " } })).toThrow(
      RequestError,
    );
  });

  it("parses a flat resend body and keeps a missing session unset", () => {
    expect(
      parseResendOtpResponse({
        success: true,
        message: "OTP resent successfully",
        challengeName: "CUSTOM_CHALLENGE",
      }),
    ).toEqual({});
  });

  it("returns a resend session only when it is a non-empty string", () => {
    expect(
      parseResendOtpResponse({
        success: true,
        message: "OTP resent successfully",
        session: "next-session",
      }),
    ).toEqual({ session: "next-session" });
    expect(
      parseResendOtpResponse({
        success: true,
        message: "OTP resent successfully",
        session: "   ",
      }),
    ).toEqual({});
  });

  it("rejects a resend body without the required message", () => {
    expect(() => parseResendOtpResponse({ success: true })).toThrow(RequestError);
  });

  it("requires access and refresh tokens from the flat verify body", () => {
    expect(
      parseVerifyOtpResponse({
        success: true,
        accessToken: "access",
        idToken: "id",
        expiresIn: 3600,
        tokenType: "Bearer",
        refreshToken: "refresh",
      }),
    ).toEqual({ accessToken: "access", refreshToken: "refresh", idToken: "id" });
  });

  it("accepts verify when the optional id token is missing", () => {
    expect(
      parseVerifyOtpResponse({
        success: true,
        accessToken: "access",
        refreshToken: "refresh",
      }),
    ).toEqual({ accessToken: "access", refreshToken: "refresh" });
  });

  it("rejects verify when the refresh token is missing", () => {
    expect(() => parseVerifyOtpResponse({ success: true, accessToken: "access", idToken: "id" })).toThrow(
      RequestError,
    );
  });

  it("reads refresh tokens from data and omits blank optional fields", () => {
    expect(
      parseRefreshResponse({
        success: true,
        data: {
          accessToken: "new-access",
          idToken: " ",
          refreshToken: "",
          expiresIn: 3600,
          tokenType: "Bearer",
        },
      }),
    ).toEqual({ accessToken: "new-access" });
  });

  it("rejects a flat refresh body and a data object without an access token", () => {
    expect(() => parseRefreshResponse({ success: true, accessToken: "access", refreshToken: "refresh" })).toThrow(
      RequestError,
    );
    expect(() => parseRefreshResponse({ success: true, data: { refreshToken: "refresh" } })).toThrow(RequestError);
  });

  it("keeps stored credentials when refresh omits them", () => {
    expect(applyRefreshUpdate(stored, { accessToken: "new-access" })).toEqual({
      accessToken: "new-access",
      refreshToken: "old-refresh",
      idToken: "old-id",
    });
  });

  it("replaces only the refresh fields that arrived", () => {
    expect(
      applyRefreshUpdate(stored, { accessToken: "new-access", refreshToken: "new-refresh" }),
    ).toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
      idToken: "old-id",
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
