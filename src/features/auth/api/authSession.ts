import { clearAuthTokens, saveAuthTokens } from "../storage/tokenStorage";
import type { AuthTokens } from "../types/auth.types";

type AuthTokensListener = (tokens: AuthTokens | null) => void;

let accessToken: string | null = null;
let idToken: string | null = null;
const listeners = new Set<AuthTokensListener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function getIdToken(): string | null {
  return idToken;
}

export function setMemoryTokens(tokens: AuthTokens): void {
  accessToken = tokens.accessToken;
  idToken = tokens.idToken;
}

export function clearMemoryTokens(): void {
  accessToken = null;
  idToken = null;
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
  setMemoryTokens(tokens);
  await saveAuthTokens(tokens);
  notify(tokens);
}

export async function clearSessionTokens(): Promise<void> {
  clearMemoryTokens();
  await clearAuthTokens();
  notify(null);
}
