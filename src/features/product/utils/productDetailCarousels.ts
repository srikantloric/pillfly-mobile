import {
  PRODUCT_DETAIL_CAROUSEL_SECTIONS,
  type ProductDetailCarouselSectionConfig,
} from "@/features/product/mocks/detail.mock";
import { productService } from "@/features/product/services/product.service";
import type { Product } from "@/features/product/types/product";

import { createSingleEntryCache } from "./productDetailBuilders.cache";

const carouselSectionsCache = createSingleEntryCache<string, ProductDetailCarouselSection[]>();

export type ProductDetailCarouselSection = ProductDetailCarouselSectionConfig & {
  products: Product[];
};

export function resolveCarouselProducts(
  productIds: readonly string[],
  excludeProductId?: string,
): Product[] {
  const seen = new Set<string>();

  return productIds
    .map((id) => productService.getProductById(id))
    .filter((product): product is Product => {
      if (!product) {
        return false;
      }
      if (excludeProductId && product.id === excludeProductId) {
        return false;
      }
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
}

function buildProductDetailCarouselSections(
  excludeProductId: string,
): ProductDetailCarouselSection[] {
  return PRODUCT_DETAIL_CAROUSEL_SECTIONS.map((section) => ({
    ...section,
    products: resolveCarouselProducts(section.productIds, excludeProductId),
  })).filter((section) => section.products.length > 0);
}

export function getProductDetailCarouselSections(
  excludeProductId: string,
): ProductDetailCarouselSection[] {
  return carouselSectionsCache.get(excludeProductId, () =>
    buildProductDetailCarouselSections(excludeProductId),
  );
}
