import { RequestError } from "@/services/api/requestError";

import type {
  CatalogCategory,
  CatalogCategoryList,
  CatalogCategoryPagination,
} from "../types/catalogCategory.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function malformed(): RequestError {
  return new RequestError("Unexpected response from server.", { kind: "malformed" });
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalString(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function requiredNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function requiredBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parseParentId(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseCatalogCategory(value: unknown): CatalogCategory | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = requiredString(value.id);
  const name = requiredString(value.name);
  const slug = requiredString(value.slug);
  const order = requiredNumber(value.order);
  const status = requiredString(value.status);
  const createdAt = requiredString(value.createdAt);
  const updatedAt = requiredString(value.updatedAt);
  const description = optionalString(value.description);
  const image = optionalString(value.image);
  const parentId = parseParentId(value.parentId);

  if (!id || !name || !slug || order === null || !status || !createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    name,
    slug,
    order,
    status,
    createdAt,
    updatedAt,
    ...(description !== undefined ? { description } : {}),
    ...(image !== undefined ? { image } : {}),
    ...(parentId !== undefined ? { parentId } : {}),
  };
}

function parsePagination(value: unknown): CatalogCategoryPagination | null {
  if (!isRecord(value)) {
    return null;
  }

  const hitsPerPage = requiredNumber(value.hitsPerPage);
  const hasMore = requiredBoolean(value.hasMore);
  if (hitsPerPage === null || hitsPerPage <= 0 || hasMore === null) {
    return null;
  }

  let nextCursor: string | undefined;
  if (value.nextCursor == null) {
    nextCursor = undefined;
  } else if (typeof value.nextCursor === "string") {
    const trimmed = value.nextCursor.trim();
    nextCursor = trimmed.length > 0 ? trimmed : undefined;
  } else {
    return null;
  }

  const page = requiredNumber(value.page);
  const nbHits = requiredNumber(value.nbHits);
  const nbPages = requiredNumber(value.nbPages);

  return {
    hitsPerPage,
    hasMore,
    ...(nextCursor !== undefined ? { nextCursor } : {}),
    ...(page !== null ? { page } : {}),
    ...(nbHits !== null ? { nbHits } : {}),
    ...(nbPages !== null ? { nbPages } : {}),
  };
}

export function parseCatalogCategoryListResponse(data: unknown): CatalogCategoryList {
  if (!isRecord(data) || data.success !== true || !isRecord(data.data)) {
    throw malformed();
  }

  if (!Array.isArray(data.data.items)) {
    throw malformed();
  }

  const items = data.data.items.map(parseCatalogCategory);
  if (items.some((item) => item == null)) {
    throw malformed();
  }

  const pagination = parsePagination(data.data.pagination);
  if (!pagination) {
    throw malformed();
  }

  return {
    items: items as CatalogCategory[],
    pagination,
  };
}
