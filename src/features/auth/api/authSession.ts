import { clearAuthTokens, saveAuthTokens } from "../storage/tokenStorage";
import type { AuthTokens } from "../types/auth.types";

/**
 * Single in-memory holder of the session tokens. The interceptors read from here,
 * and listeners (auth store, cart) are told when tokens are replaced or cleared.
 */
type AuthTokensListener = (tokens: AuthTokens | null) => void;

let accessToken: string | null = null;
const listeners = new Set<AuthTokensListener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setMemoryTokens(tokens: AuthTokens): void {
  accessToken = tokens.accessToken;
}

export function clearMemoryTokens(): void {
  accessToken = null;
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
