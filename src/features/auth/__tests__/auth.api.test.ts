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

import { RequestError } from "@/services/api/requestError";

import {
  getCurrentCustomer,
  logoutCustomer,
  resendCustomerOtp,
  sendCustomerOtp,
  verifyCustomerOtp,
} from "../api/auth.api";
import { clearMemoryTokens, setMemoryTokens } from "../api/authSession";
import { AUTH_PATHS, isPublicAuthPath, isRefreshAuthPath } from "../api/auth.paths";

describe("auth.api", () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockSaveAuthTokens.mockReset();
    mockClearAuthTokens.mockReset();
    clearMemoryTokens();
  });

  it("posts the mobile to send-otp and returns the session", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: {
          message: "OTP sent successfully",
          session: "cognito-session-token",
          challengeName: "CUSTOM_CHALLENGE",
        },
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
        refreshToken: "refresh",
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
      refreshToken: "refresh",
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

  it("stores verify tokens when the optional id token is absent", async () => {
    mockPost.mockResolvedValue({
      data: { success: true, accessToken: "access", refreshToken: "refresh" },
    });
    mockSaveAuthTokens.mockResolvedValue(undefined);

    await verifyCustomerOtp({ mobile: "9876543210", otp: "123456", session: "s" });

    expect(mockSaveAuthTokens).toHaveBeenCalledWith({
      accessToken: "access",
      refreshToken: "refresh",
    });
  });

  it("resends OTP to the challenge mobile", async () => {
    mockPost.mockResolvedValue({
      data: { success: true, data: { message: "OTP resent successfully" } },
    });

    await expect(resendCustomerOtp("9876543210")).resolves.toEqual({});

    expect(mockPost).toHaveBeenCalledWith(AUTH_PATHS.resendOtp, { mobile: "9876543210" });
  });

  it("returns a replacement session from resend when the server sends one", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: { message: "OTP resent successfully", session: "next-session" },
      },
    });

    await expect(resendCustomerOtp("9876543210")).resolves.toEqual({ session: "next-session" });
  });

  it("posts the stored refresh token to logout", async () => {
    setMemoryTokens({ accessToken: "access", refreshToken: "refresh-token", idToken: "id" });
    mockPost.mockResolvedValue({ data: { success: true } });

    await logoutCustomer();

    expect(mockPost).toHaveBeenCalledWith("/auth/app/logout", { refreshToken: "refresh-token" });
  });

  it("skips logout when no refresh token is stored", async () => {
    await logoutCustomer();

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("loads the current customer from /api/v1/customer/me", async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        user: {
          id: "CUS_123",
          phoneNumber: "+919876543210",
          status: "ACTIVE",
        },
      },
    });

    const user = await getCurrentCustomer();

    expect(mockGet).toHaveBeenCalledWith("/customer/me");
    expect(user).toEqual({
      id: "CUS_123",
      phoneNumber: "+919876543210",
      status: "ACTIVE",
    });
  });
});

describe("auth paths", () => {
  it("points each call at the current auth and customer routes", () => {
    expect(AUTH_PATHS).toEqual({
      sendOtp: "/auth/send-otp",
      verifyOtp: "/auth/app/verify-otp",
      resendOtp: "/auth/resend-otp",
      refresh: "/auth/app/refresh",
      logout: "/auth/app/logout",
      me: "/customer/me",
    });
  });

  it("treats OTP routes as public and only the app refresh route as refresh", () => {
    expect(isPublicAuthPath("/auth/send-otp")).toBe(true);
    expect(isPublicAuthPath("/auth/resend-otp")).toBe(true);
    expect(isPublicAuthPath("/auth/app/verify-otp")).toBe(true);
    expect(isPublicAuthPath("/api/v1/auth/app/verify-otp")).toBe(true);
    expect(isPublicAuthPath("/auth/app/refresh")).toBe(false);
    expect(isPublicAuthPath("/auth/app/logout")).toBe(false);
    expect(isPublicAuthPath("/customer/me")).toBe(false);

    expect(isRefreshAuthPath("/auth/app/refresh")).toBe(true);
    expect(isRefreshAuthPath("/api/v1/auth/app/refresh")).toBe(true);
    expect(isRefreshAuthPath("/auth/app/logout")).toBe(false);
    expect(isRefreshAuthPath("/auth/resend-otp")).toBe(false);
  });
});
