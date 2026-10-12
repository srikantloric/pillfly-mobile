export const PRODUCT_PATHS = {
  storeList: "/products/store",
  storeDetail: (productId: string) => `/products/store/${encodeURIComponent(productId)}`,
  search: "/products/search",
} as const;
