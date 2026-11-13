import {
  DEFAULT_CATEGORY_TILE_BG,
  isRootCatalogCategory,
  mapCatalogCategory,
} from "../api/mapCatalogCategory";
import type { CatalogCategory } from "../types/catalogCategory.types";

const base: CatalogCategory = {
  id: "cat_1",
  name: "Skin Care",
  slug: "skin-care",
  order: 3,
  status: "ACTIVE",
  createdAt: "2026-03-20T10:00:00.000Z",
  updatedAt: "2026-03-20T10:00:00.000Z",
  parentId: null,
};

describe("mapCatalogCategory", () => {
  it("maps API fields onto Category UI shape", () => {
    expect(
      mapCatalogCategory({
        ...base,
        description: "Face and body",
        image: "https://cdn.example.com/skin.jpg",
      }),
    ).toEqual({
      id: "cat_1",
      title: "Skin Care",
      description: "Face and body",
      image: { uri: "https://cdn.example.com/skin.jpg" },
      tileBg: DEFAULT_CATEGORY_TILE_BG,
    });
  });

  it("omits empty or missing images", () => {
    expect(mapCatalogCategory(base).image).toBeUndefined();
    expect(mapCatalogCategory({ ...base, image: "   " }).image).toBeUndefined();
  });

  it("treats null and missing parentId as root", () => {
    expect(isRootCatalogCategory(base)).toBe(true);
    expect(isRootCatalogCategory({ ...base, parentId: undefined })).toBe(true);
    expect(isRootCatalogCategory({ ...base, parentId: "parent" })).toBe(false);
  });
});
