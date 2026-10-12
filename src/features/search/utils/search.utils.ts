import { PREVIOUSLY_BOUGHT_PRODUCT_IDS } from "@/features/search/mocks/search.mock";
import { productService, type Product } from "@/features/product";

export {
  formatInr,
  getProductImageUrl,
  getProductPackLabel,
  getProductMrp,
  getProductPricing,
  getProductRating,
  getProductStock,
  isMedicineProduct,
  isProductInStock,
} from "@/features/product";

export function getPreviouslyBoughtProducts(): Product[] {
  return PREVIOUSLY_BOUGHT_PRODUCT_IDS.map((id) => productService.getProductById(id)).filter(
    (product): product is Product => product != null,
  );
}
