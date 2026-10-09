const mockLoadAuthTokens = jest.fn();
const mockSaveAuthTokens = jest.fn();
const mockClearAuthTokens = jest.fn();
const mockGetCurrentCustomer = jest.fn();
const mockVerifyCustomerOtp = jest.fn();
const mockSendCustomerOtp = jest.fn();
const mockResendCustomerOtp = jest.fn();
const mockLogoutCustomer = jest.fn();

jest.mock("../storage/tokenStorage", () => ({
  loadAuthTokens: (...args: unknown[]) => mockLoadAuthTokens(...args),
  saveAuthTokens: (...args: unknown[]) => mockSaveAuthTokens(...args),
  clearAuthTokens: (...args: unknown[]) => mockClearAuthTokens(...args),
}));

jest.mock("../api/auth.api", () => ({
  getCurrentCustomer: (...args: unknown[]) => mockGetCurrentCustomer(...args),
  verifyCustomerOtp: (...args: unknown[]) => mockVerifyCustomerOtp(...args),
  sendCustomerOtp: (...args: unknown[]) => mockSendCustomerOtp(...args),
  resendCustomerOtp: (...args: unknown[]) => mockResendCustomerOtp(...args),
  logoutCustomer: (...args: unknown[]) => mockLogoutCustomer(...args),
}));

import { clearMemoryTokens, getAccessToken } from "../api/authSession";
import { resetAuthStoreForTests, useAuthStore } from "../store/auth.store";
import { AuthRequestError } from "../utils/authRequestError";

const activeUser = {
  id: "CUS_123",
  phoneNumber: "+919876543210",
  name: "Priya Sharma",
  status: "ACTIVE" as const,
  createdAt: "2026-08-26T10:00:00.000Z",
  updatedAt: "2026-08-26T10:00:00.000Z",
};

describe("auth store", () => {
  beforeEach(() => {
    resetAuthStoreForTests();
    clearMemoryTokens();
    mockLoadAuthTokens.mockReset();
    mockSaveAuthTokens.mockReset();
    mockClearAuthTokens.mockReset().mockResolvedValue(undefined);
    mockGetCurrentCustomer.mockReset();
    mockVerifyCustomerOtp.mockReset();
    mockSendCustomerOtp.mockReset();
    mockResendCustomerOtp.mockReset();
    mockLogoutCustomer.mockReset();
  });

  it("restores an ACTIVE customer session", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockResolvedValue({ success: true, user: activeUser });

    await useAuthStore.getState().restoreSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(activeUser);
    expect(state.isLoading).toBe(false);
    expect(state.hasHydrated).toBe(true);
    expect(mockGetCurrentCustomer).toHaveBeenCalledTimes(1);
  });

  it("skips login restore when no tokens are stored", async () => {
    mockLoadAuthTokens.mockResolvedValue(null);

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      user: null,
      hasHydrated: true,
      isLoading: false,
    });
    expect(mockGetCurrentCustomer).not.toHaveBeenCalled();
  });

  it("runs restore only once until retry", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockResolvedValue({ success: true, user: activeUser });

    await Promise.all([
      useAuthStore.getState().restoreSession(),
      useAuthStore.getState().restoreSession(),
    ]);
    await useAuthStore.getState().restoreSession();

    expect(mockGetCurrentCustomer).toHaveBeenCalledTimes(1);
  });

  it("clears a BLOCKED customer on restore", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockResolvedValue({
      success: true,
      user: { ...activeUser, status: "BLOCKED" },
    });

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockClearAuthTokens).toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it("keeps tokens on restore network failure without marking authenticated", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockRejectedValue(
      new AuthRequestError("Network error. Check your connection and try again.", { kind: "network" }),
    );

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBe("access");
    expect(mockClearAuthTokens).not.toHaveBeenCalled();
  });

  it("stores the send-otp session for verify", async () => {
    mockSendCustomerOtp.mockResolvedValue({
      success: true,
      message: "OTP sent successfully",
      session: "cognito-session-token",
      challengeName: "CUSTOM_CHALLENGE",
    });

    await useAuthStore.getState().sendOtp("+91 98765 43210");

    expect(useAuthStore.getState().otpChallenge).toEqual({
      mobile: "9876543210",
      session: "cognito-session-token",
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("does not treat profile failure after verify as an invalid OTP", async () => {
    useAuthStore.setState({
      otpChallenge: { mobile: "9876543210", session: "cognito-session-token" },
    });
    mockVerifyCustomerOtp.mockResolvedValue({
      success: true,
      accessToken: "access",
      idToken: "id",
    });
    mockGetCurrentCustomer.mockRejectedValue(
      new AuthRequestError("Unable to get customer profile.", { status: 500, kind: "http" }),
    );

    await expect(useAuthStore.getState().verifyOtp("123456")).rejects.toThrow(
      /profile could not be loaded/i,
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe("access");
    expect(state.otpChallenge).toBeNull();
    expect(state.authError).not.toMatch(/invalid or expired otp/i);
    expect(mockVerifyCustomerOtp).toHaveBeenCalledWith({
      mobile: "9876543210",
      otp: "123456",
      session: "cognito-session-token",
    });
  });

  it("signs out locally even when logout API fails", async () => {
    useAuthStore.setState({
      accessToken: "access",
      idToken: "id",
      user: activeUser,
      isAuthenticated: true,
      isLoading: false,
      hasHydrated: true,
    });
    mockLogoutCustomer.mockRejectedValue(new AuthRequestError("Unauthorized", { status: 401 }));

    await useAuthStore.getState().signOut();

    expect(mockClearAuthTokens).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
