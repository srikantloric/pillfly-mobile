export function createSingleEntryCache<TKey extends string, TValue>() {
  let cachedKey: TKey | null = null;
  let cachedValue: TValue | null = null;

  return {
    get(key: TKey, build: () => TValue): TValue {
      if (cachedKey === key && cachedValue != null) {
        return cachedValue;
      }
      cachedKey = key;
      cachedValue = build();
      return cachedValue;
    },
    clear() {
      cachedKey = null;
      cachedValue = null;
    },
  };
}
