import { RequestError } from "@/services/api/requestError";

import type { AuthTokens, Customer, RefreshTokenUpdate } from "../types/auth.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function trimmed(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) {
    return undefined;
  }
  return value.trim();
}

function malformed(): RequestError {
  return new RequestError("Unexpected response from server.", { kind: "malformed" });
}

function requireSuccess(data: unknown): Record<string, unknown> {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }
  return data;
}

/** send-otp nests the Cognito session under `data`. The session is not stored as a credential. */
export function parseSendOtpResponse(data: unknown): string {
  const body = requireSuccess(data);
  const session = isRecord(body.data) ? trimmed(body.data.session) : undefined;
  if (!session) {
    throw malformed();
  }
  return session;
}

/**
 * resend-otp is a flat body. `session` is optional; a blank value is not a replacement.
 */
export function parseResendOtpResponse(data: unknown): { session?: string } {
  const body = requireSuccess(data);
  if (!trimmed(body.message)) {
    throw malformed();
  }

  const session = trimmed(body.session);
  return session ? { session } : {};
}

/** app verify-otp is flat. `accessToken` and `refreshToken` are required; `idToken` is optional. */
export function parseVerifyOtpResponse(data: unknown): AuthTokens {
  const body = requireSuccess(data);
  const accessToken = trimmed(body.accessToken);
  const refreshToken = trimmed(body.refreshToken);
  if (!accessToken || !refreshToken) {
    throw malformed();
  }

  const idToken = trimmed(body.idToken);
  return {
    accessToken,
    refreshToken,
    ...(idToken ? { idToken } : {}),
  };
}

/** app refresh wraps tokens in `data`. Only `accessToken` is required there. */
export function parseRefreshResponse(data: unknown): RefreshTokenUpdate {
  const body = requireSuccess(data);
  if (!isRecord(body.data)) {
    throw malformed();
  }

  const accessToken = trimmed(body.data.accessToken);
  if (!accessToken) {
    throw malformed();
  }

  const refreshToken = trimmed(body.data.refreshToken);
  const idToken = trimmed(body.data.idToken);
  return {
    accessToken,
    ...(refreshToken ? { refreshToken } : {}),
    ...(idToken ? { idToken } : {}),
  };
}

/** Keeps the previous refresh and ID tokens when the refresh body omits them. */
export function applyRefreshUpdate(current: AuthTokens | null, update: RefreshTokenUpdate): AuthTokens {
  const refreshToken = update.refreshToken ?? current?.refreshToken;
  if (!refreshToken) {
    throw malformed();
  }

  const idToken = update.idToken ?? current?.idToken;
  return {
    accessToken: update.accessToken,
    refreshToken,
    ...(idToken ? { idToken } : {}),
  };
}

export function parseGetMeResponse(data: unknown): Customer {
  const { user } = requireSuccess(data);
  if (
    !isRecord(user) ||
    !isNonEmptyString(user.id) ||
    !isNonEmptyString(user.phoneNumber) ||
    (user.status !== "ACTIVE" && user.status !== "BLOCKED")
  ) {
    throw malformed();
  }

  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    status: user.status,
    ...(typeof user.name === "string" ? { name: user.name } : {}),
  };
}
