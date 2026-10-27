export function mergeUniqueBy<T>(
  existing: readonly T[],
  incoming: readonly T[],
  keyOf: (item: T) => string,
): T[] {
  const seen = new Set(existing.map(keyOf));
  const merged = [...existing];

  for (const item of incoming) {
    const key = keyOf(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  return merged;
}
