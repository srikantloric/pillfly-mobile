import type { ApiError } from "../types/auth.types";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    value.success === false &&
    typeof value.message === "string" &&
    value.message.trim().length > 0
  );
}

export function getApiErrorMessage(value: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  if (isApiError(value)) {
    return value.message;
  }

  if (isRecord(value) && typeof value.message === "string" && value.message.trim()) {
    return value.message;
  }

  return fallback;
}

export function messageForHttpStatus(status: number | undefined): string {
  switch (status) {
    case 400:
      return "Unable to complete this request.";
    case 401:
      return "Session expired. Please login again.";
    case 403:
      return "This account cannot be used.";
    case 404:
      return "Customer profile not found.";
    case 500:
      return "Unable to get customer profile.";
    default:
      return DEFAULT_ERROR_MESSAGE;
  }
}
