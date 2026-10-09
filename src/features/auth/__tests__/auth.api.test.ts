const mockPost = jest.fn();
const mockGet = jest.fn();
const mockSaveAuthTokens = jest.fn();
const mockClearAuthTokens = jest.fn();

jest.mock("@/services/api/auth.client", () => ({
  authClient: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock("../storage/tokenStorage", () => ({
  saveAuthTokens: (...args: unknown[]) => mockSaveAuthTokens(...args),
  clearAuthTokens: (...args: unknown[]) => mockClearAuthTokens(...args),
  loadAuthTokens: jest.fn(),
}));

import {
  resendCustomerOtp,
  sendCustomerOtp,
  verifyCustomerOtp,
} from "../api/auth.api";
import { AUTH_PATHS } from "../api/auth.paths";
import { AuthRequestError } from "../utils/authRequestError";

describe("auth.api", () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockSaveAuthTokens.mockReset();
    mockClearAuthTokens.mockReset();
  });

  it("sends a normalized 10-digit mobile to send-otp", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        message: "OTP sent successfully",
        session: "cognito-session-token",
        challengeName: "CUSTOM_CHALLENGE",
      },
    });

    const result = await sendCustomerOtp("+91 98765 43210");

    expect(mockPost).toHaveBeenCalledWith(AUTH_PATHS.sendOtp, { mobile: "9876543210" });
    expect(result.session).toBe("cognito-session-token");
  });

  it("rejects invalid mobiles before calling the API", async () => {
    await expect(sendCustomerOtp("12345")).rejects.toBeInstanceOf(AuthRequestError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("verifies OTP with the provided session and stores tokens", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        accessToken: "access",
        idToken: "id",
        expiresIn: 3600,
        tokenType: "Bearer",
      },
    });
    mockSaveAuthTokens.mockResolvedValue(undefined);

    await verifyCustomerOtp({
      mobile: "9876543210",
      otp: "123456",
      session: "cognito-session-token",
    });

    expect(mockPost).toHaveBeenCalledWith(AUTH_PATHS.verifyOtp, {
      mobile: "9876543210",
      otp: "123456",
      session: "cognito-session-token",
    });
    expect(mockSaveAuthTokens).toHaveBeenCalledWith({
      accessToken: "access",
      idToken: "id",
    });
  });

  it("does not invent a session for verify-otp", async () => {
    await expect(
      verifyCustomerOtp({ mobile: "9876543210", otp: "123456", session: "   " }),
    ).rejects.toBeInstanceOf(AuthRequestError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("resends OTP with the same normalized mobile", async () => {
    mockPost.mockResolvedValue({
      data: { success: true, message: "OTP resent successfully" },
    });

    await resendCustomerOtp("919876543210");

    expect(mockPost).toHaveBeenCalledWith(AUTH_PATHS.resendOtp, { mobile: "9876543210" });
  });
});
