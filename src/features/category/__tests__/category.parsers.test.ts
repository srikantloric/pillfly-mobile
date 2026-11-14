import { RequestError } from "@/services/api/requestError";

import {
  parseCatalogCategory,
  parseCatalogCategoryListResponse,
} from "../api/category.parsers";

const timestamps = {
  createdAt: "2026-03-20T10:00:00.000Z",
  updatedAt: "2026-03-20T10:00:00.000Z",
};

function categoryPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "cat_root_1",
    name: "Personal Care",
    slug: "personal-care",
    description: "Everyday essentials",
    image: "https://cdn.example.com/categories/personal-care.jpg",
    parentId: null,
    order: 1,
    status: "ACTIVE",
    ...timestamps,
    ...overrides,
  };
}

describe("category.parsers", () => {
  it("parses a catalog category with optional fields", () => {
    expect(parseCatalogCategory(categoryPayload())).toEqual({
      id: "cat_root_1",
      name: "Personal Care",
      slug: "personal-care",
      description: "Everyday essentials",
      image: "https://cdn.example.com/categories/personal-care.jpg",
      parentId: null,
      order: 1,
      status: "ACTIVE",
      ...timestamps,
    });
  });

  it("parses nested categories with a parent id", () => {
    expect(parseCatalogCategory(categoryPayload({ parentId: "cat_root_1", order: 2 }))).toMatchObject({
      parentId: "cat_root_1",
      order: 2,
    });
  });

  it("rejects malformed category items", () => {
    expect(parseCatalogCategory({ id: "x" })).toBeNull();
    expect(parseCatalogCategory(null)).toBeNull();
  });

  it("parses a list response and pagination metadata", () => {
    const result = parseCatalogCategoryListResponse({
      success: true,
      data: {
        items: [categoryPayload(), categoryPayload({ id: "cat_child", parentId: "cat_root_1", order: 2 })],
        pagination: {
          hitsPerPage: 20,
          nextCursor: "opaque-cursor",
          hasMore: true,
          page: 0,
          nbHits: 2,
          nbPages: 1,
        },
      },
    });

    expect(result.items).toHaveLength(2);
    expect(result.pagination).toEqual({
      hitsPerPage: 20,
      nextCursor: "opaque-cursor",
      hasMore: true,
      page: 0,
      nbHits: 2,
      nbPages: 1,
    });
  });

  it("allows missing nextCursor when hasMore is false", () => {
    const result = parseCatalogCategoryListResponse({
      success: true,
      data: {
        items: [],
        pagination: { hitsPerPage: 20, hasMore: false },
      },
    });

    expect(result.items).toEqual([]);
    expect(result.pagination.nextCursor).toBeUndefined();
    expect(result.pagination.hasMore).toBe(false);
  });

  it("throws RequestError for malformed list envelopes", () => {
    expect(() => parseCatalogCategoryListResponse({ success: false })).toThrow(RequestError);
    expect(() =>
      parseCatalogCategoryListResponse({
        success: true,
        data: { items: [{ id: "bad" }], pagination: { hitsPerPage: 20, hasMore: false } },
      }),
    ).toThrow(RequestError);
  });
});
