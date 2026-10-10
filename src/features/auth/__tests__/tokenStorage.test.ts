const mockSetGenericPassword = jest.fn();
const mockGetGenericPassword = jest.fn();
const mockResetGenericPassword = jest.fn();

jest.mock("react-native-keychain", () => ({
  ACCESSIBLE: {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: "AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY",
  },
  setGenericPassword: (...args: unknown[]) => mockSetGenericPassword(...args),
  getGenericPassword: (...args: unknown[]) => mockGetGenericPassword(...args),
  resetGenericPassword: (...args: unknown[]) => mockResetGenericPassword(...args),
}));

import { clearAuthTokens, loadAuthTokens, saveAuthTokens } from "../storage/tokenStorage";

describe("tokenStorage", () => {
  beforeEach(() => {
    mockSetGenericPassword.mockReset();
    mockGetGenericPassword.mockReset();
    mockResetGenericPassword.mockReset();
  });

  it("saves access and id tokens only", async () => {
    mockSetGenericPassword.mockResolvedValue(true);

    await saveAuthTokens({ accessToken: "access", idToken: "id" });

    expect(mockSetGenericPassword).toHaveBeenCalledTimes(1);
    const [, password] = mockSetGenericPassword.mock.calls[0] as [string, string];
    expect(JSON.parse(password)).toEqual({ accessToken: "access", idToken: "id" });
  });

  it("loads valid stored tokens", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "pillfly-customer",
      password: JSON.stringify({ accessToken: "access", idToken: "id" }),
    });

    await expect(loadAuthTokens()).resolves.toEqual({
      accessToken: "access",
      idToken: "id",
    });
    expect(mockResetGenericPassword).not.toHaveBeenCalled();
  });

  it("clears malformed stored payloads", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "pillfly-customer",
      password: "not-json",
    });
    mockResetGenericPassword.mockResolvedValue(true);

    await expect(loadAuthTokens()).resolves.toBeNull();
    expect(mockResetGenericPassword).toHaveBeenCalled();
  });

  it("returns null when nothing is stored", async () => {
    mockGetGenericPassword.mockResolvedValue(false);

    await expect(loadAuthTokens()).resolves.toBeNull();
  });

  it("clears tokens", async () => {
    mockResetGenericPassword.mockResolvedValue(true);

    await clearAuthTokens();

    expect(mockResetGenericPassword).toHaveBeenCalled();
  });
});
