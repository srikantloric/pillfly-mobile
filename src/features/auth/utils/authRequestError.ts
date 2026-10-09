import { getApiErrorMessage, messageForHttpStatus } from "./apiError";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type AuthErrorKind = "network" | "http" | "malformed";

export class AuthRequestError extends Error {
  readonly status?: number;
  readonly kind: AuthErrorKind;

  constructor(message: string, options?: { status?: number; kind?: AuthErrorKind }) {
    super(message);
    this.name = "AuthRequestError";
    this.status = options?.status;
    this.kind = options?.kind ?? "http";
  }
}

export function toAuthRequestError(error: unknown): AuthRequestError {
  if (error instanceof AuthRequestError) {
    return error;
  }

  if (isRecord(error) && isRecord(error.response)) {
    const status = typeof error.response.status === "number" ? error.response.status : undefined;
    return new AuthRequestError(getApiErrorMessage(error.response.data, messageForHttpStatus(status)), {
      status,
      kind: "http",
    });
  }

  if (isRecord(error) && error.request != null && error.response == null) {
    return new AuthRequestError("Network error. Check your connection and try again.", {
      kind: "network",
    });
  }

  if (error instanceof Error && error.message.trim()) {
    return new AuthRequestError(error.message, { kind: "malformed" });
  }

  return new AuthRequestError("Something went wrong. Please try again.", { kind: "malformed" });
}
