import type { Category } from "@/types/category.types";

import type { CatalogCategory } from "../types/catalogCategory.types";

export const DEFAULT_CATEGORY_TILE_BG = "#EEF6F5";

export function isRootCatalogCategory(category: CatalogCategory): boolean {
  return category.parentId == null;
}

export function mapCatalogCategory(category: CatalogCategory): Category {
  const imageUri = category.image?.trim();

  return {
    id: category.id,
    title: category.name,
    tileBg: DEFAULT_CATEGORY_TILE_BG,
    ...(imageUri ? { image: { uri: imageUri } } : {}),
    ...(category.description ? { description: category.description } : {}),
  };
}
