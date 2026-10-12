import type { ProductSearchHit } from "@/features/product/types/storeProduct";

export function mergeUniqueHits(
  existing: readonly ProductSearchHit[],
  incoming: readonly ProductSearchHit[],
): ProductSearchHit[] {
  const seen = new Set(existing.map((hit) => hit.productId));
  const merged = [...existing];

  for (const hit of incoming) {
    if (seen.has(hit.productId)) {
      continue;
    }
    seen.add(hit.productId);
    merged.push(hit);
  }

  return merged;
}

export function hasMoreSearchPages(page: number, nbPages: number): boolean {
  if (nbPages <= 0) {
    return false;
  }

  return page < nbPages - 1;
}
