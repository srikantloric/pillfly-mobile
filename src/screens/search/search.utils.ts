import {
  PREVIOUSLY_BOUGHT_PRODUCT_IDS,
  SEARCH_KEYWORD_SUGGESTIONS,
} from "@/mocks/search.mock";
import { productService } from "@/services/product.service";
import type { MedicineProduct, Product } from "@/types/product";

export function getKeywordSuggestions(query: string, limit = 5): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const fromMock = SEARCH_KEYWORD_SUGGESTIONS.filter((term) =>
    term.toLowerCase().includes(normalized),
  );

  const fromProducts = productService.searchProducts(query).map((product) => product.title);

  const seen = new Set<string>();
  const merged: string[] = [];

  for (const term of [...fromMock, ...fromProducts]) {
    const key = term.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(term);
    if (merged.length >= limit) {
      break;
    }
  }

  return merged;
}

export function getProductSuggestions(query: string, limit = 6): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  return productService.searchProducts(query).slice(0, limit);
}

export function getPreviouslyBoughtProducts(): Product[] {
  return PREVIOUSLY_BOUGHT_PRODUCT_IDS.map((id) =>
    productService.getProductById(id),
  ).filter((product): product is Product => product != null);
}

export function getResultsForSearch(params: {
  query: string;
  categoryId?: string;
}): Product[] {
  if (params.categoryId) {
    return productService.getProductsByCategory(params.categoryId);
  }

  const query = params.query.trim();
  if (!query) {
    return productService.getAllProducts();
  }

  return productService.searchProducts(query);
}

export function isMedicineProduct(product: Product): product is MedicineProduct {
  return product.productType === "MEDICINE";
}

export function getProductImageUrl(product: Product): string | undefined {
  if (product.productType === "MEDICINE") {
    return product.images[0]?.url;
  }

  const variant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  return variant?.images[0]?.url;
}

export function getProductPackLabel(product: Product): string | undefined {
  if (product.productType === "MEDICINE") {
    return product.medicineDetails.packSize;
  }

  const variant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  if (!variant) {
    return undefined;
  }

  const sizeOption = product.variantOptions.find((opt) => opt.id === "size");
  const sizeValue = sizeOption?.values.find((v) =>
    variant.optionValueIds.includes(v.id),
  );
  return sizeValue?.value;
}

export function getProductMrp(product: Product): number | undefined {
  if (product.productType === "MEDICINE") {
    return product.mrp;
  }

  const variant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  return variant?.mrp;
}

export function getDiscountPercent(product: Product): number | undefined {
  if (product.productType === "MEDICINE" && product.discount != null) {
    return product.discount;
  }
  return undefined;
}

export function formatInr(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function getUnitPriceLabel(product: Product): string | undefined {
  if (!isMedicineProduct(product)) {
    return undefined;
  }

  const pack = product.medicineDetails.packSize;
  const countMatch = pack.match(/(\d+)/);
  const count = countMatch ? Number(countMatch[1]) : 0;
  if (count <= 0) {
    return undefined;
  }

  const unit =
    product.medicineDetails.dosageForm === "TABLET"
      ? "tablet"
      : product.medicineDetails.dosageForm === "CAPSULE"
        ? "capsule"
        : "unit";

  return `${formatInr(product.mrp / count)}/${unit}`;
}
