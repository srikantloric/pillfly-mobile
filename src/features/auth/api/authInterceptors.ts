import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { authClient } from "@/services/api/auth.client";

import { parseTokenResponse } from "./auth.parsers";
import { AUTH_PATHS, getRequestPath, isPublicAuthPath, isRefreshAuthPath } from "./auth.paths";
import { clearSessionTokens, getAccessToken, persistSessionTokens } from "./authSession";

type RetryableConfig = InternalAxiosRequestConfig & {
  _pillflyAuthRetry?: boolean;
};

export type AuthInterceptorOptions = {
  /** Paths that may return 401 without meaning the session expired (e.g. public catalog). */
  skipRefresh?: (path: string) => boolean;
};

let refreshInFlight: Promise<void> | null = null;

/** Refreshes via the cookie-backed endpoint; concurrent 401s share one refresh call. */
function refreshAccessToken(): Promise<void> {
  refreshInFlight ??= (async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.refresh);
    await persistSessionTokens(parseTokenResponse(response.data));
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export function attachAuthInterceptors(
  client: AxiosInstance,
  options: AuthInterceptorOptions = {},
): void {
  client.interceptors.request.use((config) => {
    const path = getRequestPath(config.url);
    const accessToken = getAccessToken();

    if (accessToken && !isPublicAuthPath(path) && !isRefreshAuthPath(path)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableConfig | undefined;

      if (!config || error.response?.status !== 401 || config._pillflyAuthRetry) {
        return Promise.reject(error);
      }

      const path = getRequestPath(config.url);
      if (isPublicAuthPath(path) || isRefreshAuthPath(path) || options.skipRefresh?.(path)) {
        return Promise.reject(error);
      }

      try {
        await refreshAccessToken();
      } catch (refreshError) {
        await clearSessionTokens();
        return Promise.reject(refreshError);
      }

      config._pillflyAuthRetry = true;
      return client.request(config);
    },
  );
}
