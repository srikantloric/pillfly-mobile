export const PRODUCT_PATHS = {
  storeList: "/products/store",
  storeDetail: (productId: string) => `/products/store/${encodeURIComponent(productId)}`,
  search: "/products/search",
} as const;

export function isPublicProductPath(path: string): boolean {
  return /\/products\/store(?:\/|$)/.test(path) || /\/products\/search(?:\/|$)/.test(path);
}
