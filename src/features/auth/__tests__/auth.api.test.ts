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
import { RequestError } from "@/services/api/requestError";

describe("auth.api", () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockSaveAuthTokens.mockReset();
    mockClearAuthTokens.mockReset();
  });

  it("posts the mobile to send-otp and returns the session", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        message: "OTP sent successfully",
        session: "cognito-session-token",
        challengeName: "CUSTOM_CHALLENGE",
      },
    });

    const session = await sendCustomerOtp("9876543210");

    expect(mockPost).toHaveBeenCalledWith(AUTH_PATHS.sendOtp, { mobile: "9876543210" });
    expect(session).toBe("cognito-session-token");
  });

  it("maps HTTP failures to user-facing RequestErrors", async () => {
    mockPost.mockRejectedValue({ response: { status: 403, data: {} } });

    await expect(sendCustomerOtp("9876543210")).rejects.toMatchObject({
      status: 403,
      message: "This account cannot be used.",
    });
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

  it("does not store tokens when verify-otp returns a malformed body", async () => {
    mockPost.mockResolvedValue({ data: { success: true } });

    await expect(
      verifyCustomerOtp({ mobile: "9876543210", otp: "123456", session: "s" }),
    ).rejects.toBeInstanceOf(RequestError);
    expect(mockSaveAuthTokens).not.toHaveBeenCalled();
  });

  it("resends OTP to the challenge mobile", async () => {
    mockPost.mockResolvedValue({
      data: { success: true, message: "OTP resent successfully" },
    });

    await resendCustomerOtp("9876543210");

    expect(mockPost).toHaveBeenCalledWith(AUTH_PATHS.resendOtp, { mobile: "9876543210" });
  });
});
