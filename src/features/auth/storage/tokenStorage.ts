import * as Keychain from "react-native-keychain";

import type { AuthTokens } from "../types/auth.types";

const TOKEN_SERVICE = "com.pillfly.auth.tokens";
const TOKEN_ACCOUNT = "pillfly-customer";

function isAuthTokens(value: unknown): value is AuthTokens {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.accessToken === "string" && typeof record.idToken === "string";
}

export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  await Keychain.setGenericPassword(TOKEN_ACCOUNT, JSON.stringify(tokens), {
    service: TOKEN_SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function loadAuthTokens(): Promise<AuthTokens | null> {
  const credentials = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });

  if (!credentials) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(credentials.password);
    if (!isAuthTokens(parsed) || !parsed.accessToken || !parsed.idToken) {
      await clearAuthTokens();
      return null;
    }
    return parsed;
  } catch {
    await clearAuthTokens();
    return null;
  }
}

export async function clearAuthTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
}
