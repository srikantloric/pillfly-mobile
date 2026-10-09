import { clearAuthTokens, saveAuthTokens } from "../storage/tokenStorage";
import type { AuthTokens } from "../types/auth.types";

let accessToken: string | null = null;
let idToken: string | null = null;

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

export async function persistSessionTokens(tokens: AuthTokens): Promise<void> {
  setMemoryTokens(tokens);
  await saveAuthTokens(tokens);
}

export async function clearSessionTokens(): Promise<void> {
  clearMemoryTokens();
  await clearAuthTokens();
}
