import type {
  Customer,
  GetMeResponse,
  ResendOtpResponse,
  SendOtpResponse,
  TokenResponse,
} from "../types/auth.types";
import { AuthRequestError } from "../utils/authRequestError";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function malformed(message = "Unexpected response from server."): AuthRequestError {
  return new AuthRequestError(message, { kind: "malformed" });
}

export function parseSendOtpResponse(data: unknown): SendOtpResponse {
  if (!isRecord(data) || data.success !== true || typeof data.session !== "string" || !data.session.trim()) {
    throw malformed();
  }

  if (data.challengeName != null && data.challengeName !== "CUSTOM_CHALLENGE") {
    throw malformed();
  }

  return {
    success: true,
    message: "OTP sent successfully",
    session: data.session,
    challengeName: "CUSTOM_CHALLENGE",
  };
}

export function parseResendOtpResponse(data: unknown): ResendOtpResponse {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }

  return {
    success: true,
    message: "OTP resent successfully",
  };
}

export function parseTokenResponse(data: unknown): TokenResponse {
  if (
    !isRecord(data) ||
    data.success !== true ||
    typeof data.accessToken !== "string" ||
    !data.accessToken ||
    typeof data.idToken !== "string" ||
    !data.idToken
  ) {
    throw malformed();
  }

  const parsed: TokenResponse = {
    success: true,
    accessToken: data.accessToken,
    idToken: data.idToken,
  };

  if (typeof data.expiresIn === "number") {
    parsed.expiresIn = data.expiresIn;
  }

  if (typeof data.tokenType === "string") {
    parsed.tokenType = data.tokenType;
  }

  return parsed;
}

function parseCustomer(value: unknown): Customer {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    typeof value.phoneNumber !== "string" ||
    !value.phoneNumber ||
    (value.status !== "ACTIVE" && value.status !== "BLOCKED") ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    throw malformed();
  }

  const customer: Customer = {
    id: value.id,
    phoneNumber: value.phoneNumber,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };

  if (typeof value.name === "string") {
    customer.name = value.name;
  }

  return customer;
}

export function parseGetMeResponse(data: unknown): GetMeResponse {
  if (!isRecord(data) || data.success !== true) {
    throw malformed();
  }

  return {
    success: true,
    user: parseCustomer(data.user),
  };
}
