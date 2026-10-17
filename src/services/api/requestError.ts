export type RequestErrorKind = "network" | "http" | "malformed";

export type StatusMessages = Partial<Record<number, string>>;

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_MESSAGE = "Network error. Check your connection and try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export class RequestError extends Error {
  readonly status?: number;
  readonly kind: RequestErrorKind;

  constructor(message: string, options?: { status?: number; kind?: RequestErrorKind }) {
    super(message);
    this.name = "RequestError";
    this.status = options?.status;
    this.kind = options?.kind ?? "http";
  }
}

/**
 * Converts anything thrown by an axios call into a `RequestError` with user-facing copy.
 * The server's `message` wins; otherwise `statusMessages` supplies per-status fallbacks.
 */
export function toRequestError(error: unknown, statusMessages: StatusMessages = {}): RequestError {
  if (error instanceof RequestError) {
    return error;
  }

  if (isRecord(error) && isRecord(error.response)) {
    const { status, data } = error.response;
    const code = typeof status === "number" ? status : undefined;
    const serverMessage =
      isRecord(data) && typeof data.message === "string" ? data.message.trim() : "";
    const fallback = (code !== undefined && statusMessages[code]) || DEFAULT_MESSAGE;

    return new RequestError(serverMessage || fallback, { status: code, kind: "http" });
  }

  if (isRecord(error) && error.request != null) {
    return new RequestError(NETWORK_MESSAGE, { kind: "network" });
  }

  if (error instanceof Error && error.message.trim()) {
    return new RequestError(error.message, { kind: "malformed" });
  }

  return new RequestError(DEFAULT_MESSAGE, { kind: "malformed" });
}
