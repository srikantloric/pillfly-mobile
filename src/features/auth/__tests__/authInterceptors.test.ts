import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";

import { attachAuthInterceptors, resetAuthRefreshLock } from "../api/authInterceptors";
import { AUTH_PATHS } from "../api/auth.paths";
import { clearMemoryTokens, getAccessToken, setMemoryTokens } from "../api/authSession";

jest.mock("../storage/tokenStorage", () => ({
  saveAuthTokens: jest.fn().mockResolvedValue(undefined),
  clearAuthTokens: jest.fn().mockResolvedValue(undefined),
  loadAuthTokens: jest.fn(),
}));

type HandlerResult = { status: number; data: unknown };

function createTestClient(handler: (config: InternalAxiosRequestConfig) => Promise<HandlerResult>) {
  const client = axios.create({
    baseURL: "https://example.test/api/v1/auth",
    withCredentials: true,
  });

  const adapter: AxiosAdapter = async (config) => {
    const result = await handler(config);
    const response = {
      data: result.data,
      status: result.status,
      statusText: result.status >= 400 ? "Error" : "OK",
      headers: {},
      config,
    };

    if (result.status >= 400) {
      throw new AxiosError(
        "Request failed",
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response,
      );
    }

    return response;
  };

  client.defaults.adapter = adapter;
  attachAuthInterceptors(client);
  return client;
}

describe("auth interceptors", () => {
  beforeEach(() => {
    resetAuthRefreshLock();
    clearMemoryTokens();
    setMemoryTokens({ accessToken: "old-access", idToken: "old-id" });
  });

  it("does not refresh when verify-otp returns 401", async () => {
    const urls: string[] = [];
    const client = createTestClient(async (config) => {
      urls.push(String(config.url));
      return {
        status: 401,
        data: { success: false, message: "Invalid or expired OTP" },
      };
    });

    await expect(client.post(AUTH_PATHS.verifyOtp, { mobile: "9876543210", otp: "000000", session: "s" })).rejects.toMatchObject({
      response: { data: { message: "Invalid or expired OTP" } },
    });
    expect(urls).toEqual([AUTH_PATHS.verifyOtp]);
  });

  it("shares one refresh across concurrent 401s and retries once", async () => {
    let refreshCount = 0;
    let meCount = 0;
    const client = createTestClient(async (config) => {
      if (config.url === AUTH_PATHS.refresh) {
        refreshCount += 1;
        return {
          status: 200,
          data: {
            success: true,
            accessToken: "new-access",
            idToken: "new-id",
          },
        };
      }

      meCount += 1;
      if (config.headers.Authorization === "Bearer new-access") {
        return { status: 200, data: { success: true, user: { id: "CUS_1" } } };
      }

      return { status: 401, data: { success: false, message: "Unauthorized" } };
    });

    await Promise.all([client.get(AUTH_PATHS.me), client.get(AUTH_PATHS.me)]);

    expect(refreshCount).toBe(1);
    expect(meCount).toBe(4);
    expect(getAccessToken()).toBe("new-access");
  });

  it("retries a protected request at most once", async () => {
    let meCount = 0;
    const client = createTestClient(async (config) => {
      if (config.url === AUTH_PATHS.refresh) {
        return {
          status: 200,
          data: { success: true, accessToken: "new-access", idToken: "new-id" },
        };
      }

      meCount += 1;
      return { status: 401, data: { success: false, message: "Unauthorized" } };
    });

    await expect(client.get(AUTH_PATHS.me)).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(meCount).toBe(2);
  });

  it("clears tokens when refresh fails", async () => {
    const client = createTestClient(async (config) => {
      if (config.url === AUTH_PATHS.refresh) {
        return { status: 401, data: { success: false, message: "Refresh token not found" } };
      }

      return { status: 401, data: { success: false, message: "Unauthorized" } };
    });

    await expect(client.get(AUTH_PATHS.me)).rejects.toMatchObject({
      response: { data: { message: "Refresh token not found" } },
    });
    expect(getAccessToken()).toBeNull();
  });

  it("does not attach an access token to public OTP requests", async () => {
    let authorization: unknown;
    const client = createTestClient(async (config) => {
      authorization = config.headers.Authorization;
      return {
        status: 200,
        data: {
          success: true,
          message: "OTP sent successfully",
          session: "s",
          challengeName: "CUSTOM_CHALLENGE",
        },
      };
    });

    await client.post(AUTH_PATHS.sendOtp, { mobile: "9876543210" });
    expect(authorization).toBeUndefined();
  });

  it("does not refresh public OTP 401s even when the path includes the auth prefix", async () => {
    const urls: string[] = [];
    const client = createTestClient(async (config) => {
      urls.push(String(config.url));
      return {
        status: 401,
        data: { success: false, message: "Invalid or expired OTP" },
      };
    });

    await expect(
      client.post(`/api/v1/auth${AUTH_PATHS.verifyOtp}`, {
        mobile: "9876543210",
        otp: "000000",
        session: "s",
      }),
    ).rejects.toMatchObject({
      response: { data: { message: "Invalid or expired OTP" } },
    });
    expect(urls.some((url) => url.includes(AUTH_PATHS.refresh))).toBe(false);
  });
});
