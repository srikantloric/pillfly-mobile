import { RequestError } from "@/services/api/requestError";

import type { AuthTokens, Customer } from "../types/auth.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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

/** send-otp → the Cognito session that verify-otp must echo back. */
export function parseSendOtpResponse(data: unknown): string {
  const body = requireSuccess(data);
  if (!isNonEmptyString(body.session)) {
    throw malformed();
  }
  return body.session;
}

export function parseResendOtpResponse(data: unknown): void {
  requireSuccess(data);
}

export function parseTokenResponse(data: unknown): AuthTokens {
  const body = requireSuccess(data);
  if (!isNonEmptyString(body.accessToken) || !isNonEmptyString(body.idToken)) {
    throw malformed();
  }
  return { accessToken: body.accessToken, idToken: body.idToken };
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
