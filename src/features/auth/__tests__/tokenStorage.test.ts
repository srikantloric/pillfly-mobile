const mockSetGenericPassword = jest.fn();
const mockGetGenericPassword = jest.fn();
const mockResetGenericPassword = jest.fn();

jest.mock("react-native-keychain", () => ({
  ACCESSIBLE: {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: "AccessibleAfterFirstUnlockThisDeviceOnly",
  },
  setGenericPassword: (...args: unknown[]) => mockSetGenericPassword(...args),
  getGenericPassword: (...args: unknown[]) => mockGetGenericPassword(...args),
  resetGenericPassword: (...args: unknown[]) => mockResetGenericPassword(...args),
}));

import * as Keychain from "react-native-keychain";
import {
  TOKEN_ACCOUNT,
  TOKEN_SERVICE,
  clearAuthTokens,
  loadAuthTokens,
  saveAuthTokens,
} from "../storage/tokenStorage";

const VALID_TOKENS = {
  accessToken: "header.payload.signature",
  idToken: "id.header.payload",
};

describe("tokenStorage", () => {
  beforeEach(() => {
    mockSetGenericPassword.mockReset();
    mockGetGenericPassword.mockReset();
    mockResetGenericPassword.mockReset();
  });

  it("saves valid tokens with the existing service and account", async () => {
    mockSetGenericPassword.mockResolvedValue({ service: TOKEN_SERVICE, storage: "KeystoreAESGCM" });

    await saveAuthTokens(VALID_TOKENS);

    expect(mockSetGenericPassword).toHaveBeenCalledWith(
      TOKEN_ACCOUNT,
      JSON.stringify(VALID_TOKENS),
      {
        service: TOKEN_SERVICE,
        accessible: "AccessibleAfterFirstUnlockThisDeviceOnly",
      },
    );
  });

  it("rejects malformed tokens before writing", async () => {
    await expect(saveAuthTokens({ accessToken: "", idToken: "id" } as typeof VALID_TOKENS)).rejects.toThrow(
      "Invalid auth tokens.",
    );
    await expect(
      saveAuthTokens({ accessToken: "access", idToken: "   " } as unknown as typeof VALID_TOKENS),
    ).rejects.toThrow("Invalid auth tokens.");
    expect(mockSetGenericPassword).not.toHaveBeenCalled();
  });

  it("loads valid stored credentials", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: TOKEN_ACCOUNT,
      password: JSON.stringify(VALID_TOKENS),
    });

    await expect(loadAuthTokens()).resolves.toEqual(VALID_TOKENS);
    expect(mockResetGenericPassword).not.toHaveBeenCalled();
  });

  it("returns null when no credentials exist", async () => {
    mockGetGenericPassword.mockResolvedValue(false);

    await expect(loadAuthTokens()).resolves.toBeNull();
    expect(mockResetGenericPassword).not.toHaveBeenCalled();
  });

  it("returns null when Keychain read fails without treating it as a deletion", async () => {
    mockGetGenericPassword.mockRejectedValue(new Error("Keychain unavailable"));

    await expect(loadAuthTokens()).resolves.toBeNull();
    expect(mockResetGenericPassword).not.toHaveBeenCalled();
  });

  it("clears malformed JSON exactly once", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: TOKEN_ACCOUNT,
      password: "not-json",
    });
    mockResetGenericPassword.mockResolvedValue(true);

    await expect(loadAuthTokens()).resolves.toBeNull();
    expect(mockResetGenericPassword).toHaveBeenCalledTimes(1);
    expect(mockResetGenericPassword).toHaveBeenCalledWith({ service: TOKEN_SERVICE });
  });

  it("rejects malformed payloads and empty required strings", async () => {
    mockResetGenericPassword.mockResolvedValue(true);
    mockGetGenericPassword.mockResolvedValue({
      username: TOKEN_ACCOUNT,
      password: JSON.stringify({ accessToken: "access", idToken: "" }),
    });

    await expect(loadAuthTokens()).resolves.toBeNull();
    expect(mockResetGenericPassword).toHaveBeenCalledTimes(1);
  });

  it("does not confuse cleanup failures with parse errors", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: TOKEN_ACCOUNT,
      password: "not-json",
    });
    mockResetGenericPassword.mockRejectedValue(new Error("Keychain delete failed."));

    await expect(loadAuthTokens()).rejects.toThrow("Keychain delete failed.");
    expect(mockResetGenericPassword).toHaveBeenCalledTimes(1);
  });

  it("propagates write failures", async () => {
    mockSetGenericPassword.mockResolvedValue(false);

    await expect(saveAuthTokens(VALID_TOKENS)).rejects.toThrow("Keychain write failed.");
  });

  it("propagates clear failures", async () => {
    mockResetGenericPassword.mockResolvedValue(false);

    await expect(clearAuthTokens()).rejects.toThrow("Keychain delete failed.");
  });

  it("handles an unavailable accessibility option", async () => {
    const accessible = Keychain.ACCESSIBLE as {
      AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY?: string;
    };
    const original = accessible.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY;
    accessible.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = undefined;

    try {
      await expect(saveAuthTokens(VALID_TOKENS)).rejects.toThrow(
        "Keychain accessibility AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY is unavailable.",
      );
      expect(mockSetGenericPassword).not.toHaveBeenCalled();
    } finally {
      accessible.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = original;
    }
  });

  it("preserves the existing service and account identifiers", () => {
    expect(TOKEN_SERVICE).toBe("com.pillfly.auth.tokens");
    expect(TOKEN_ACCOUNT).toBe("pillfly-customer");
  });
});
