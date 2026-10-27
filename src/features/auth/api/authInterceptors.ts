import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { authClient } from "@/services/api/auth.client";

import { authLog, resolveRequestUrl } from "./authLog";
import { applyRefreshUpdate, parseRefreshResponse } from "./auth.parsers";
import { AUTH_PATHS, getRequestPath, isPublicAuthPath, isRefreshAuthPath } from "./auth.paths";
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  getSessionTokens,
  persistSessionTokens,
} from "./authSession";

type RetryableConfig = InternalAxiosRequestConfig & {
  _pillflyAuthRetry?: boolean;
};

export type AuthInterceptorOptions = {
  /** Paths that may return 401 without meaning the session expired (e.g. public catalog). */
  skipRefresh?: (path: string) => boolean;
};

let refreshInFlight: Promise<void> | null = null;

/** Refreshes with the Keychain refresh token in the body. Concurrent 401s share one call. */
function refreshAccessToken(): Promise<void> {
  if (refreshInFlight) {
    authLog("refresh.join");
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      authLog("refresh.fail", { message: "No refresh token" });
      throw new Error("No refresh token");
    }

    authLog("refresh.start", { url: AUTH_PATHS.refresh });
    try {
      const response = await authClient.post<unknown>(AUTH_PATHS.refresh, { refreshToken });
      const update = parseRefreshResponse(response.data);
      await persistSessionTokens(applyRefreshUpdate(getSessionTokens(), update));
      authLog("refresh.ok");
    } catch (error) {
      authLog("refresh.fail", {
        message: error instanceof Error ? error.message : "Refresh failed",
      });
      throw error;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function requestBody(data: unknown): unknown {
  if (typeof data !== "string") {
    return data;
  }

  try {
    return JSON.parse(data) as unknown;
  } catch {
    return data;
  }
}

export function attachAuthInterceptors(
  client: AxiosInstance,
  options: AuthInterceptorOptions = {},
): void {
  const logThisClient = client === authClient;

  client.interceptors.request.use((config) => {
    const path = getRequestPath(config.url);
    const accessToken = getAccessToken();
    const isPublic = isPublicAuthPath(path);
    const isRefresh = isRefreshAuthPath(path);

    if (accessToken && !isPublic && !isRefresh) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    if (logThisClient) {
      authLog("request", {
        method: (config.method ?? "get").toUpperCase(),
        url: resolveRequestUrl(config.baseURL, config.url),
        authorization: isPublic
          ? "omitted-public"
          : isRefresh
            ? "omitted-refresh"
            : accessToken
              ? "bearer"
              : "omitted-no-token",
        body: requestBody(config.data),
      });
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      if (logThisClient) {
        authLog("response", {
          method: (response.config.method ?? "get").toUpperCase(),
          url: resolveRequestUrl(response.config.baseURL, response.config.url),
          status: response.status,
          data: response.data,
        });
      }
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as RetryableConfig | undefined;
      const url = resolveRequestUrl(config?.baseURL, config?.url);

      if (logThisClient) {
        authLog("response.error", {
          method: (config?.method ?? "get").toUpperCase(),
          url,
          status: error.response?.status,
          code: error.code,
          data: error.response?.data,
        });
      }

      if (!config || error.response?.status !== 401 || config._pillflyAuthRetry) {
        if (error.response?.status === 401) {
          authLog("401.skip", {
            url,
            reason: !config ? "no-config" : "already-retried",
          });
        }
        return Promise.reject(error);
      }

      const path = getRequestPath(config.url);
      if (isPublicAuthPath(path) || isRefreshAuthPath(path) || options.skipRefresh?.(path)) {
        authLog("401.skip", {
          url,
          reason: isPublicAuthPath(path) ? "public" : isRefreshAuthPath(path) ? "refresh" : "caller-skip",
        });
        return Promise.reject(error);
      }

      authLog("401.refresh", { url });
      try {
        await refreshAccessToken();
      } catch (refreshError) {
        await clearSessionTokens();
        authLog("401.refresh-cleared-session", { url });
        return Promise.reject(refreshError);
      }

      config._pillflyAuthRetry = true;
      authLog("401.retry", { url });
      return client.request(config);
    },
  );
}
