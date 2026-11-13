import { toRequestError, type RequestError } from "@/services/api/requestError";

const AUTH_STATUS_MESSAGES = {
  400: "Unable to complete this request.",
  401: "Session expired. Please login again.",
  403: "This account cannot be used.",
  404: "Customer profile not found.",
};

export function toAuthError(error: unknown): RequestError {
  return toRequestError(error, AUTH_STATUS_MESSAGES);
}
