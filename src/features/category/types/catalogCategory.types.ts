export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  image?: string;
  parentId?: string | null;
};

export type CatalogCategoryPagination = {
  hitsPerPage: number;
  nextCursor?: string;
  hasMore: boolean;
  page?: number;
  nbHits?: number;
  nbPages?: number;
};

export type CatalogCategoryList = {
  items: CatalogCategory[];
  pagination: CatalogCategoryPagination;
};

export type ListCatalogCategoriesParams = {
  limit?: number;
  cursor?: string;
};
