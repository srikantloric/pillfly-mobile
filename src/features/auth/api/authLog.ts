const SENSITIVE_KEY = /token|otp|session|cookie|authorization|password|secret/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function redactAuthValue(value: unknown, key?: string): unknown {
  if (typeof value === "string" && key && SENSITIVE_KEY.test(key)) {
    return `[redacted ${value.length} chars]`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactAuthValue(item));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactAuthValue(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

export function resolveRequestUrl(baseURL: string | undefined, url: string | undefined): string {
  const path = url ?? "";
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = (baseURL ?? "").replace(/\/+$/, "");
  if (!path) {
    return base;
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function authLog(event: string, details?: Record<string, unknown>): void {
  if (typeof jest !== "undefined" || (typeof __DEV__ !== "undefined" && !__DEV__)) {
    return;
  }

  if (details) {
    console.log(`[auth] ${event}`, redactAuthValue(details));
    return;
  }

  console.log(`[auth] ${event}`);
}
