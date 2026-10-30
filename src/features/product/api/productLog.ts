export function productLog(event: string, details?: Record<string, unknown>): void {
  if (typeof jest !== "undefined" || (typeof __DEV__ !== "undefined" && !__DEV__)) {
    return;
  }

  if (details) {
    console.log(`[products] ${event}`, details);
    return;
  }

  console.log(`[products] ${event}`);
}
