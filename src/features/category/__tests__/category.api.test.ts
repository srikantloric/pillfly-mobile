const mockGet = jest.fn();

jest.mock("@/services/api/product.client", () => ({
  productClient: {
    get: (...args: unknown[]) => mockGet(...args),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock("@/features/product/api/product.api", () => ({}));

import { listCatalogCategories } from "../api/category.api";
import { CATEGORY_PATHS } from "../api/category.paths";
import { RequestError } from "@/services/api/requestError";

const timestamps = {
  createdAt: "2026-03-20T10:00:00.000Z",
  updatedAt: "2026-03-20T10:00:00.000Z",
};

const rootCategory = {
  id: "cat_root_1",
  name: "Personal Care",
  slug: "personal-care",
  parentId: null,
  order: 1,
  status: "ACTIVE",
  ...timestamps,
};

describe("category.api", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("lists categories with limit and cursor as query params", async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [rootCategory],
          pagination: {
            hitsPerPage: 20,
            nextCursor: "next-page",
            hasMore: true,
          },
        },
      },
    });

    const result = await listCatalogCategories({
      limit: 20,
      cursor: "next-page",
    });

    expect(mockGet).toHaveBeenCalledWith(CATEGORY_PATHS.collection, {
      params: { limit: 20, cursor: "next-page" },
    });
    expect(result.items[0]?.id).toBe("cat_root_1");
    expect(result.pagination.nextCursor).toBe("next-page");
  });

  it("defaults limit and omits empty cursor", async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [],
          pagination: { hitsPerPage: 100, hasMore: false },
        },
      },
    });

    const result = await listCatalogCategories({ cursor: "   " });

    expect(mockGet).toHaveBeenCalledWith(CATEGORY_PATHS.collection, {
      params: { limit: 100 },
    });
    expect(result.items).toEqual([]);
  });

  it("clamps limit to the documented range", async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [],
          pagination: { hitsPerPage: 100, hasMore: false },
        },
      },
    });

    await listCatalogCategories({ limit: 500 });
    expect(mockGet).toHaveBeenCalledWith(CATEGORY_PATHS.collection, {
      params: { limit: 100 },
    });

    await listCatalogCategories({ limit: 0 });
    expect(mockGet).toHaveBeenLastCalledWith(CATEGORY_PATHS.collection, {
      params: { limit: 1 },
    });
  });

  it("maps transport failures to RequestError", async () => {
    mockGet.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: { message: "Missing" } },
      message: "Request failed",
    });

    await expect(listCatalogCategories()).rejects.toBeInstanceOf(RequestError);
  });
});
