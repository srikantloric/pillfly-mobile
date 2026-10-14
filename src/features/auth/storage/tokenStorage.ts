import * as Keychain from "react-native-keychain";

import type { AuthTokens } from "../types/auth.types";

export const TOKEN_SERVICE = "com.pillfly.auth.tokens";
export const TOKEN_ACCOUNT = "pillfly-customer";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isAuthTokens(value: unknown): value is AuthTokens {
  if (!isRecord(value)) {
    return false;
  }

  return isNonEmptyString(value.accessToken) && isNonEmptyString(value.idToken);
}

function toStoredTokens(tokens: AuthTokens): AuthTokens {
  return {
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
  };
}

function resolveDeviceOnlyAccessibility(): Keychain.ACCESSIBLE {
  const option = Keychain.ACCESSIBLE?.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY;
  if (option == null) {
    throw new Error("Keychain accessibility AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY is unavailable.");
  }

  return option;
}

async function discardMalformedStoredTokens(): Promise<void> {
  await clearAuthTokens();
}

/**
 * Loads the persisted customer session.
 * Returns `null` when no credentials exist, or when Keychain cannot be read.
 * A `null` result is an unavailable/unreadable session, not proof that credentials were deleted.
 */
export async function loadAuthTokens(): Promise<AuthTokens | null> {
  let credentials: Awaited<ReturnType<typeof Keychain.getGenericPassword>>;
  try {
    credentials = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
  } catch {
    return null;
  }

  if (!credentials) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(credentials.password);
  } catch {
    await discardMalformedStoredTokens();
    return null;
  }

  if (!isAuthTokens(parsed)) {
    await discardMalformedStoredTokens();
    return null;
  }

  return toStoredTokens(parsed);
}

export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  if (!isAuthTokens(tokens)) {
    throw new Error("Invalid auth tokens.");
  }

  const payload = toStoredTokens(tokens);
  const accessible = resolveDeviceOnlyAccessibility();

  const result = await Keychain.setGenericPassword(TOKEN_ACCOUNT, JSON.stringify(payload), {
    service: TOKEN_SERVICE,
    accessible,
  });

  if (result === false) {
    throw new Error("Keychain write failed.");
  }
}

export async function clearAuthTokens(): Promise<void> {
  const result = await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
  if (result === false) {
    throw new Error("Keychain delete failed.");
  }
}
