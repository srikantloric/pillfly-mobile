const mockListCatalogCategories = jest.fn();

jest.mock("../api/category.api", () => ({
  listCatalogCategories: (...args: unknown[]) => mockListCatalogCategories(...args),
}));

import { categoryService, resetCategoryCache } from "../services/category.service";
import { RequestError } from "@/services/api/requestError";
import type { CatalogCategory } from "../types/catalogCategory.types";

const timestamps = {
  createdAt: "2026-03-20T10:00:00.000Z",
  updatedAt: "2026-03-20T10:00:00.000Z",
};

function category(overrides: Partial<CatalogCategory>): CatalogCategory {
  return {
    id: "cat_default",
    name: "Default",
    slug: "default",
    order: 1,
    status: "ACTIVE",
    parentId: null,
    ...timestamps,
    ...overrides,
  };
}

describe("category.service", () => {
  beforeEach(() => {
    resetCategoryCache();
    mockListCatalogCategories.mockReset();
  });

  it("returns only root categories sorted by order", async () => {
    mockListCatalogCategories.mockResolvedValue({
      items: [
        category({ id: "child", name: "Child", parentId: "root-a", order: 1 }),
        category({ id: "root-b", name: "Beta", parentId: null, order: 2 }),
        category({ id: "root-a", name: "Alpha", parentId: null, order: 1 }),
      ],
      pagination: { hitsPerPage: 100, hasMore: false },
    });

    const result = await categoryService.getRootCategories();

    expect(mockListCatalogCategories).toHaveBeenCalledWith({ limit: 100 });
    expect(result.categories.map((item) => item.id)).toEqual(["root-a", "root-b"]);
    expect(result.categories[0]?.title).toBe("Alpha");
    expect(result.pagination.hasMore).toBe(false);
  });

  it("caches and dedupes concurrent root fetches", async () => {
    let resolveList!: (value: unknown) => void;
    mockListCatalogCategories.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    const first = categoryService.getRootCategories();
    const second = categoryService.getRootCategories();

    resolveList({
      items: [category({ id: "root-a", name: "Alpha", parentId: null, order: 1 })],
      pagination: { hitsPerPage: 100, hasMore: true, nextCursor: "more" },
    });

    const [a, b] = await Promise.all([first, second]);

    expect(mockListCatalogCategories).toHaveBeenCalledTimes(1);
    expect(a.categories).toEqual(b.categories);
    expect(a.pagination.nextCursor).toBe("more");

    await categoryService.getRootCategories();
    expect(mockListCatalogCategories).toHaveBeenCalledTimes(1);
  });

  it("does not fall back to mock data when the API fails", async () => {
    mockListCatalogCategories.mockRejectedValue(
      new RequestError("Categories not found.", { status: 404 }),
    );

    await expect(categoryService.getRootCategories()).rejects.toBeInstanceOf(RequestError);
  });

  it("refetches when fresh is requested", async () => {
    mockListCatalogCategories
      .mockResolvedValueOnce({
        items: [category({ id: "root-a", name: "Alpha", parentId: null, order: 1 })],
        pagination: { hitsPerPage: 100, hasMore: false },
      })
      .mockResolvedValueOnce({
        items: [category({ id: "root-b", name: "Beta", parentId: null, order: 1 })],
        pagination: { hitsPerPage: 100, hasMore: false },
      });

    await categoryService.getRootCategories();
    const refreshed = await categoryService.getRootCategories({ fresh: true });

    expect(mockListCatalogCategories).toHaveBeenCalledTimes(2);
    expect(refreshed.categories[0]?.id).toBe("root-b");
  });
});
