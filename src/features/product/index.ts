export type { Product } from "./types/product";
export type { ProductSearchHit } from "./types/storeProduct";
export { productService } from "./services/product.service";
export { useProductSearch } from "./hooks/useProductSearch";
export {
  formatInr,
  getProductImageUrl,
  getProductPackLabel,
  getProductPricing,
  getProductRating,
  isMedicineProduct,
  isProductInStock,
} from "./utils/productDisplay";
export { ProductListRow } from "./components/ProductListRow";
export { ProductDetailScreen } from "./screens/ProductDetailScreen";
