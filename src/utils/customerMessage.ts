import { RequestError } from "@/services/api/requestError";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const VALIDATION_MESSAGE = "Please check your information and try again.";
const PRODUCT_MESSAGE = "This product is currently unavailable.";
const ORDER_MESSAGE = "We couldn't find this order.";
const ADDRESS_MESSAGE = "We couldn't find this address.";
const SESSION_MESSAGE = "Your session has expired. Please log in again.";
const NETWORK_MESSAGE = "Please check your internet connection.";
const SERVER_MESSAGE = "We're having trouble connecting. Please try again later.";

const SESSION_TEXT = /^(unauthorized|please sign in again\.?)$/i;
const PRODUCT_TEXT = /^product not found\b/i;
const ORDER_TEXT = /^order not found\b/i;
const ADDRESS_TEXT = /^address not found\b/i;
const VALIDATION_TEXT = /^validation failed\.?$/i;
const UNEXPECTED_TEXT = /^unexpected response from server\.?$/i;
const NETWORK_TEXT = /^network error\b/i;
const FAILED_LOAD_TEXT = /^failed to (load|search)\b/i;
const REQUEST_FAILED_TEXT = /^request failed\b/i;

type FailureKind = "network" | "http" | "malformed";

type Failure = {
  status?: number;
  kind?: FailureKind;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const SHORT_INTERNAL_ID =
  /\b(?:var(?:iant)?|prod(?:uct)?|prd|ord(?:er)?|sku|addr(?:ess)?)[_-][a-z0-9]+\b/i;
const CODE_INTERNAL_ID = /\b(?:PRD|ORD|VAR|SKU|ADDR)\d+[A-Z0-9]*\b/;
const COMPACT_INTERNAL_ID = /\b(?:prd|ord|var|sku|prod)\d+\b/i;

function isUnsafeMessage(message: string): boolean {
  return (
    message.length > 180 ||
    /[{}[\]<>]/.test(message) ||
    /\b(undefined|null|NaN|TypeError|ReferenceError|Axios|ECONN|stack|status code)\b/i.test(message) ||
    SHORT_INTERNAL_ID.test(message) ||
    CODE_INTERNAL_ID.test(message) ||
    COMPACT_INTERNAL_ID.test(message) ||
    /\b[A-Za-z0-9_-]{20,}\b/.test(message) ||
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(message) ||
    /https?:\/\//i.test(message)
  );
}

function parseJsonRecord(value: string): Record<string, unknown> | null {
  if (!value.startsWith("{") && !value.startsWith("[")) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function extractMessage(value: unknown, depth = 0): string {
  if (depth > 4 || value == null) {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const parsed = parseJsonRecord(trimmed);
    return parsed ? extractMessage(parsed, depth + 1) : trimmed;
  }

  if (!isRecord(value)) {
    return "";
  }

  return (
    extractMessage(value.message, depth + 1) ||
    extractMessage(value.description, depth + 1) ||
    extractMessage(value.error, depth + 1) ||
    extractMessage(value.data, depth + 1)
  );
}

function readFailure(error: unknown): Failure {
  if (error instanceof RequestError) {
    return { status: error.status, kind: error.kind, message: extractMessage(error.message) };
  }

  if (typeof error === "string") {
    return { message: extractMessage(error) };
  }

  if (isRecord(error) || error instanceof Error) {
    const record = error as Record<string, unknown>;
    const response = isRecord(record.response) ? record.response : undefined;
    const status = typeof response?.status === "number" ? response.status : undefined;
    const message = (response ? extractMessage(response.data) : "") || extractMessage(record.message);
    const kind = !response && "request" in record && record.request != null ? "network" : undefined;
    return { status, kind, message };
  }

  return { message: "" };
}

export function toCustomerMessage(error: unknown): string {
  const { status, kind, message } = readFailure(error);

  if (kind === "network" || NETWORK_TEXT.test(message)) {
    return NETWORK_MESSAGE;
  }

  if (
    status === 401 &&
    (message.length === 0 ||
      message === GENERIC_MESSAGE ||
      SESSION_TEXT.test(message) ||
      REQUEST_FAILED_TEXT.test(message) ||
      isUnsafeMessage(message))
  ) {
    return SESSION_MESSAGE;
  }

  if (SESSION_TEXT.test(message)) {
    return SESSION_MESSAGE;
  }

  if (PRODUCT_TEXT.test(message)) {
    return PRODUCT_MESSAGE;
  }

  if (ORDER_TEXT.test(message)) {
    return ORDER_MESSAGE;
  }

  if (ADDRESS_TEXT.test(message)) {
    return ADDRESS_MESSAGE;
  }

  if (VALIDATION_TEXT.test(message)) {
    return VALIDATION_MESSAGE;
  }

  if (kind === "malformed" || UNEXPECTED_TEXT.test(message) || FAILED_LOAD_TEXT.test(message)) {
    return GENERIC_MESSAGE;
  }

  if ((status ?? 0) >= 500) {
    if (
      message.length === 0 ||
      message === GENERIC_MESSAGE ||
      REQUEST_FAILED_TEXT.test(message) ||
      isUnsafeMessage(message)
    ) {
      return SERVER_MESSAGE;
    }

    return message;
  }

  if (status === 404 && (message.length === 0 || REQUEST_FAILED_TEXT.test(message) || isUnsafeMessage(message))) {
    return GENERIC_MESSAGE;
  }

  if (isUnsafeMessage(message) || REQUEST_FAILED_TEXT.test(message)) {
    return GENERIC_MESSAGE;
  }

  if (message.length > 0) {
    return message;
  }

  return GENERIC_MESSAGE;
}
