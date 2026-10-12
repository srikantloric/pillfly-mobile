import type { Product } from "@/features/product/types/product";

export function mergeUniqueProducts(
  existing: readonly Product[],
  incoming: readonly Product[],
): Product[] {
  const seen = new Set(existing.map((product) => product.id));
  const merged = [...existing];

  for (const product of incoming) {
    if (seen.has(product.id)) {
      continue;
    }
    seen.add(product.id);
    merged.push(product);
  }

  return merged;
}
