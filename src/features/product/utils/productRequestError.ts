function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.message === "string" && value.message.trim()) {
    return value.message.trim();
  }

  return fallback;
}

function messageForHttpStatus(status: number | undefined): string {
  switch (status) {
    case 400:
      return "Unable to complete this request.";
    case 404:
      return "Product not found.";
    case 500:
      return "Something went wrong. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export type ProductErrorKind = "network" | "http" | "malformed";

export class ProductRequestError extends Error {
  readonly status?: number;
  readonly kind: ProductErrorKind;

  constructor(message: string, options?: { status?: number; kind?: ProductErrorKind }) {
    super(message);
    this.name = "ProductRequestError";
    this.status = options?.status;
    this.kind = options?.kind ?? "http";
  }
}

export function toProductRequestError(error: unknown): ProductRequestError {
  if (error instanceof ProductRequestError) {
    return error;
  }

  if (isRecord(error) && isRecord(error.response)) {
    const status = typeof error.response.status === "number" ? error.response.status : undefined;
    return new ProductRequestError(readMessage(error.response.data, messageForHttpStatus(status)), {
      status,
      kind: "http",
    });
  }

  if (isRecord(error) && error.request != null && error.response == null) {
    return new ProductRequestError("Network error. Check your connection and try again.", {
      kind: "network",
    });
  }

  if (error instanceof Error && error.message.trim()) {
    return new ProductRequestError(error.message, { kind: "malformed" });
  }

  return new ProductRequestError("Something went wrong. Please try again.", { kind: "malformed" });
}
