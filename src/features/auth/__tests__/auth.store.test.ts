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

import { useCartStore } from "@/features/cart/store/cart.store";

import { RequestError } from "@/services/api/requestError";

import {
  clearMemoryTokens,
  getAccessToken,
  persistSessionTokens,
  setMemoryTokens,
} from "../api/authSession";
import { resetAuthStoreForTests, useAuthStore } from "../store/auth.store";

const leftoverCartAddress = {
  id: "addr_1",
  label: "Home",
  line1: "12 MG Road",
  city: "Bengaluru",
  pincode: "560001",
};

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
    useCartStore.setState({ items: [], deliveryAddress: null });
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
    mockGetCurrentCustomer.mockResolvedValue(activeUser);

    await useAuthStore.getState().restoreSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(activeUser);
    expect(state.hasHydrated).toBe(true);
    expect(mockGetCurrentCustomer).toHaveBeenCalledTimes(1);
  });

  it("keeps refreshed tokens after restore profile succeeds", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "old-access", idToken: "old-id" });
    mockGetCurrentCustomer.mockImplementation(async () => {
      await persistSessionTokens({ accessToken: "new-access", idToken: "new-id" });
      return activeUser;
    });

    await useAuthStore.getState().restoreSession();

    expect(getAccessToken()).toBe("new-access");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("skips login restore when no tokens are stored", async () => {
    mockLoadAuthTokens.mockResolvedValue(null);

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      user: null,
      hasHydrated: true,
    });
    expect(mockGetCurrentCustomer).not.toHaveBeenCalled();
  });

  it("runs restore only once until retry", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockResolvedValue(activeUser);

    await Promise.all([
      useAuthStore.getState().restoreSession(),
      useAuthStore.getState().restoreSession(),
    ]);
    await useAuthStore.getState().restoreSession();

    expect(mockGetCurrentCustomer).toHaveBeenCalledTimes(1);
  });

  it("clears a BLOCKED customer on restore", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockResolvedValue({ ...activeUser, status: "BLOCKED" });

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockClearAuthTokens).toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it("keeps tokens on restore network failure without marking authenticated", async () => {
    mockLoadAuthTokens.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockRejectedValue(
      new RequestError("Network error. Check your connection and try again.", { kind: "network" }),
    );

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(getAccessToken()).toBe("access");
    expect(mockClearAuthTokens).not.toHaveBeenCalled();
  });

  it("stores the send-otp session for verify", async () => {
    mockSendCustomerOtp.mockResolvedValue("cognito-session-token");

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
    mockVerifyCustomerOtp.mockImplementation(async () => {
      setMemoryTokens({ accessToken: "access", idToken: "id" });
      return { accessToken: "access", idToken: "id" };
    });
    mockGetCurrentCustomer.mockRejectedValue(
      new RequestError("Unable to get customer profile.", { status: 500, kind: "http" }),
    );

    await expect(useAuthStore.getState().verifyOtp("123456")).rejects.toThrow(
      /profile could not be loaded/i,
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(getAccessToken()).toBe("access");
    expect(state.otpChallenge).toBeNull();
    expect(state.authError).not.toMatch(/invalid or expired otp/i);
    expect(mockVerifyCustomerOtp).toHaveBeenCalledWith({
      mobile: "9876543210",
      otp: "123456",
      session: "cognito-session-token",
    });
  });

  it("signs out locally even when logout API fails", async () => {
    setMemoryTokens({ accessToken: "access", idToken: "id" });
    useAuthStore.setState({
      user: activeUser,
      isAuthenticated: true,
      hasHydrated: true,
    });
    mockLogoutCustomer.mockRejectedValue(new RequestError("Unauthorized", { status: 401 }));

    useCartStore.setState({
      items: [{ productId: "prod_123", quantity: 2 }],
      deliveryAddress: leftoverCartAddress,
    });

    await useAuthStore.getState().signOut();

    expect(mockClearAuthTokens).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().deliveryAddress).toBeNull();
  });

  it("clears a leftover cart when restore finds no session", async () => {
    mockLoadAuthTokens.mockResolvedValue(null);
    useCartStore.setState({
      items: [{ productId: "prod_123", quantity: 1 }],
      deliveryAddress: leftoverCartAddress,
    });

    await useAuthStore.getState().restoreSession();

    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().deliveryAddress).toBeNull();
  });

  it("rejects an invalid mobile before calling send-otp", async () => {
    await expect(useAuthStore.getState().sendOtp("12345")).rejects.toBeInstanceOf(RequestError);

    expect(mockSendCustomerOtp).not.toHaveBeenCalled();
    expect(useAuthStore.getState().authError).toBe("Enter a valid Indian mobile number");
    expect(useAuthStore.getState().isSubmitting).toBe(false);
  });

  it("keeps the OTP challenge when verify-otp fails so the user can retry", async () => {
    const challenge = { mobile: "9876543210", session: "cognito-session-token" };
    useAuthStore.setState({ otpChallenge: challenge });
    mockVerifyCustomerOtp.mockRejectedValue(
      new RequestError("Invalid or expired OTP", { status: 401 }),
    );

    await expect(useAuthStore.getState().verifyOtp("000000")).rejects.toThrow("Invalid or expired OTP");

    expect(useAuthStore.getState()).toMatchObject({
      otpChallenge: challenge,
      authError: "Invalid or expired OTP",
      isSubmitting: false,
      isAuthenticated: false,
    });
  });

  it("rejects a malformed OTP and a missing challenge without calling the API", async () => {
    await expect(useAuthStore.getState().verifyOtp("123456")).rejects.toThrow(/OTP session expired/);

    useAuthStore.setState({ otpChallenge: { mobile: "9876543210", session: "s" } });
    await expect(useAuthStore.getState().verifyOtp("12a")).rejects.toThrow(/6-digit OTP/);

    expect(mockVerifyCustomerOtp).not.toHaveBeenCalled();
  });

  it("authenticates an ACTIVE customer after verify", async () => {
    useAuthStore.setState({ otpChallenge: { mobile: "9876543210", session: "s" } });
    mockVerifyCustomerOtp.mockResolvedValue({ accessToken: "access", idToken: "id" });
    mockGetCurrentCustomer.mockResolvedValue(activeUser);

    await useAuthStore.getState().verifyOtp("123456");

    expect(useAuthStore.getState()).toMatchObject({
      user: activeUser,
      isAuthenticated: true,
      isSubmitting: false,
      otpChallenge: null,
      authError: null,
    });
  });

  it("clears the session when a BLOCKED customer verifies", async () => {
    useAuthStore.setState({ otpChallenge: { mobile: "9876543210", session: "s" } });
    mockVerifyCustomerOtp.mockImplementation(async () => {
      setMemoryTokens({ accessToken: "access", idToken: "id" });
      return { accessToken: "access", idToken: "id" };
    });
    mockGetCurrentCustomer.mockResolvedValue({ ...activeUser, status: "BLOCKED" });

    await expect(useAuthStore.getState().verifyOtp("123456")).rejects.toThrow(
      "This account cannot be used.",
    );

    expect(getAccessToken()).toBeNull();
    expect(mockClearAuthTokens).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isSubmitting: false,
      authError: "This account cannot be used.",
    });
  });

  it("logs out when tokens are cleared outside the store", async () => {
    useAuthStore.setState({ user: activeUser, isAuthenticated: true, hasHydrated: true });

    // e.g. the interceptor's refresh failed
    await persistSessionTokens({ accessToken: "a", idToken: "i" });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    const { clearSessionTokens } = jest.requireActual("../api/authSession");
    await clearSessionTokens();

    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false });
  });
});
