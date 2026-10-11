import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { authClient } from "@/services/api/auth.client";

import { parseTokenResponse } from "./auth.parsers";
import { AUTH_PATHS, getRequestPath, isPublicAuthPath, isRefreshAuthPath } from "./auth.paths";
import { clearSessionTokens, getAccessToken, persistSessionTokens } from "./authSession";

type RetryableConfig = InternalAxiosRequestConfig & {
  _pillflyAuthRetry?: boolean;
};

let refreshInFlight: Promise<void> | null = null;
const attachedClients = new WeakSet<AxiosInstance>();

function requestPath(config: InternalAxiosRequestConfig): string {
  return getRequestPath(config.url, config.baseURL);
}

async function refreshAccessToken(): Promise<void> {
  if (refreshInFlight) {
    await refreshInFlight;
    return;
  }

  refreshInFlight = (async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.refresh);
    const tokens = parseTokenResponse(response.data);
    await persistSessionTokens({
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
    });
  })().finally(() => {
    refreshInFlight = null;
  });

  await refreshInFlight;
}

export function resetAuthRefreshLock(): void {
  refreshInFlight = null;
}

export function attachAuthInterceptors(client: AxiosInstance): void {
  if (attachedClients.has(client)) {
    return;
  }
  attachedClients.add(client);

  client.interceptors.request.use((config) => {
    const path = requestPath(config);
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
      const status = error.response?.status;

      if (!config || status !== 401) {
        return Promise.reject(error);
      }

      const path = requestPath(config);

      if (isPublicAuthPath(path) || isRefreshAuthPath(path) || config._pillflyAuthRetry) {
        return Promise.reject(error);
      }

      try {
        await refreshAccessToken();
      } catch (refreshError) {
        await clearSessionTokens();
        return Promise.reject(refreshError);
      }

      config._pillflyAuthRetry = true;
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return client.request(config);
    },
  );
}

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}
