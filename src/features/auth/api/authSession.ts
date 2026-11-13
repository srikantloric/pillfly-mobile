import { clearAuthTokens, saveAuthTokens } from "../storage/tokenStorage";
import type { AuthTokens } from "../types/auth.types";

type AuthTokensListener = (tokens: AuthTokens | null) => void;

let sessionTokens: AuthTokens | null = null;
const listeners = new Set<AuthTokensListener>();

export function getAccessToken(): string | null {
  return sessionTokens?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return sessionTokens?.refreshToken ?? null;
}

export function getSessionTokens(): AuthTokens | null {
  if (!sessionTokens) {
    return null;
  }

  return { ...sessionTokens };
}

export function setMemoryTokens(tokens: AuthTokens): void {
  sessionTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    ...(tokens.idToken ? { idToken: tokens.idToken } : {}),
  };
}

export function clearMemoryTokens(): void {
  sessionTokens = null;
}

function notify(tokens: AuthTokens | null): void {
  listeners.forEach((listener) => listener(tokens));
}

export function subscribeAuthTokens(listener: AuthTokensListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function persistSessionTokens(tokens: AuthTokens): Promise<void> {
  await saveAuthTokens(tokens);
  setMemoryTokens(tokens);
  notify(tokens);
}

export async function clearSessionTokens(): Promise<void> {
  clearMemoryTokens();
  try {
    await clearAuthTokens();
  } finally {
    // Listeners must see the logout even if the Keychain delete fails.
    notify(null);
  }
}
