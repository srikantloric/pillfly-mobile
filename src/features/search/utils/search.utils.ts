import { PREVIOUSLY_BOUGHT_PRODUCT_IDS } from "@/features/search/mocks/search.mock";
import { productService } from "@/features/product/services/product.service";
import type { Product } from "@/features/product/types/product";

export function getPreviouslyBoughtProducts(): Product[] {
  return PREVIOUSLY_BOUGHT_PRODUCT_IDS.map((id) => productService.getProductById(id)).filter(
    (product): product is Product => product != null,
  );
}
