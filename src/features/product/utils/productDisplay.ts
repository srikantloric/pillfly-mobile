import { PRODUCT_SEARCH_RATINGS } from "@/features/search/mocks/search.mock";
import type { HealthcareProduct, MedicineProduct, Product, ProductVariant } from "@/features/product/types/product";

export interface ProductPricing {
  mrp: number;
  salePrice: number;
  discountPercent: number;
}

export function isMedicineProduct(product: Product): product is MedicineProduct {
  return product.productType === "MEDICINE";
}

export function isHealthcareProduct(product: Product): product is HealthcareProduct {
  return product.productType === "HEALTHCARE";
}

export function getDefaultVariant(product: HealthcareProduct) {
  return product.variants.find((v) => v.isDefault) ?? product.variants[0];
}

export function getProductImageUrl(product: Product): string | undefined {
  if (isMedicineProduct(product)) {
    return product.images[0]?.url;
  }

  return getDefaultVariant(product)?.images[0]?.url;
}

export function getProductStock(product: Product): number {
  if (isMedicineProduct(product)) {
    return product.stock;
  }

  return getDefaultVariant(product)?.stock ?? 0;
}

function isPurchasable(inStock: boolean | undefined, availableQty: number): boolean {
  if (inStock === false || availableQty === 0) {
    return false;
  }

  return availableQty > 0;
}

export function isProductInStock(product: Product): boolean {
  if (isMedicineProduct(product)) {
    return isPurchasable(product.inStock, product.stock);
  }

  const variant = getDefaultVariant(product);
  if (!variant) {
    return false;
  }

  return isPurchasable(variant.inStock, variant.stock);
}

export function getProductPackLabel(product: Product): string | undefined {
  if (isMedicineProduct(product)) {
    const packSize = product.medicineDetails.packSize.trim();
    return packSize || undefined;
  }

  const variant = getDefaultVariant(product);
  if (!variant) {
    return undefined;
  }

  for (const option of product.variantOptions) {
    const value = option.values.find((v) => variant.optionValueIds.includes(v.id));
    if (value) {
      return `${value.value} in ${option.name}`;
    }
  }

  return undefined;
}

function getPricedVariant(product: Product): ProductVariant | undefined {
  if (isHealthcareProduct(product)) {
    return getDefaultVariant(product);
  }

  return undefined;
}

export function getProductMrp(product: Product): number | undefined {
  if (isMedicineProduct(product)) {
    return product.mrp;
  }

  return getDefaultVariant(product)?.mrp;
}

export function getProductPricing(product: Product): ProductPricing | null {
  if (isMedicineProduct(product)) {
    return {
      mrp: product.mrp,
      salePrice: product.sellingPrice ?? product.mrp,
      discountPercent: product.discount ?? 0,
    };
  }

  const variant = getPricedVariant(product);
  if (!variant) {
    return null;
  }

  return {
    mrp: variant.mrp,
    salePrice: variant.sellingPrice ?? variant.mrp,
    discountPercent: variant.discount ?? 0,
  };
}

export function getProductRating(product: Product): number | undefined {
  return PRODUCT_SEARCH_RATINGS[product.id];
}

export function formatInr(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getProductImages(product: Product): string[] {
  if (isMedicineProduct(product)) {
    const urls = product.images.map((image) => image.url).filter(Boolean);
    return urls.length > 0 ? urls : [];
  }

  const variant = getDefaultVariant(product);
  const urls = variant?.images.map((image) => image.url).filter(Boolean) ?? [];
  return urls;
}

export function getProductManufacturerLabel(product: Product): string | undefined {
  if (isMedicineProduct(product)) {
    const manufacturer = product.medicineDetails.manufacturer.trim();
    return manufacturer || undefined;
  }

  return product.brand?.trim() || undefined;
}

export function getProductPackLabelDisplay(product: Product): string | undefined {
  const label = getProductPackLabel(product);
  return label ? label.toUpperCase() : undefined;
}

export function getProductUnitPriceDetail(product: Product): string | undefined {
  if (!isMedicineProduct(product)) {
    return undefined;
  }

  const pricing = getProductPricing(product);
  if (!pricing) {
    return undefined;
  }

  const countMatch = product.medicineDetails.packSize.match(/(\d+)/);
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

  const perUnit = roundMoney(pricing.salePrice / count);
  return `${formatInr(perUnit)}/${unit} (Inclusive of all taxes)`;
}

export function getProductSaltCompositionDisplay(product: Product): string | undefined {
  if (!isMedicineProduct(product)) {
    return undefined;
  }

  const salt = product.medicineDetails.saltComposition.trim();
  if (!salt) {
    return undefined;
  }

  const mgMatch = salt.match(/(\d+(?:\.\d+)?)\s*mg/i);
  if (mgMatch && /paracetamol/i.test(salt)) {
    return `Paracetamol / Acetaminophen(${mgMatch[1]}.0 Mg)`;
  }

  return salt;
}

export function getProductTherapeuticClassDisplay(product: Product): string | undefined {
  if (!isMedicineProduct(product)) {
    return undefined;
  }

  const therapy = product.medicineDetails.therapy.trim();
  return therapy ? therapy.toUpperCase() : undefined;
}

export function getProductPlusCreditsAmount(product: Product): number {
  const pricing = getProductPricing(product);
  if (!pricing) {
    return 2;
  }

  return Math.max(1, Math.round(pricing.salePrice * 0.08));
}
