import { PRODUCT_SEARCH_RATINGS } from "@/features/search/mocks/search.mock";
import type { HealthcareProduct, MedicineProduct, Product } from "@/features/product/types/product";

/** Shown when API/catalog does not send an explicit discount yet. */
const DEFAULT_CATALOG_DISCOUNT_PERCENT = 22;

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

/**
 * Sellable quantity for the listing shown in search/grid.
 * Medicine: product.stock. Healthcare: default (or first) variant stock.
 */
export function getProductStock(product: Product): number {
  if (isMedicineProduct(product)) {
    return product.stock;
  }

  return getDefaultVariant(product)?.stock ?? 0;
}

export function isProductInStock(product: Product): boolean {
  return getProductStock(product) > 0;
}

export function getProductPackLabel(product: Product): string | undefined {
  if (isMedicineProduct(product)) {
    return formatMedicineQuantityLabel(product);
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

function formatMedicineQuantityLabel(product: MedicineProduct): string {
  const { packSize, dosageForm } = product.medicineDetails;
  const countMatch = packSize.match(/(\d+)/);
  const count = countMatch?.[1];

  if (!count) {
    return packSize;
  }

  const unitLabel =
    dosageForm === "TABLET"
      ? "Tablet"
      : dosageForm === "CAPSULE"
        ? "Capsule"
        : dosageForm === "SYRUP"
          ? "Unit"
          : "Unit";

  const plural = Number(count) === 1 ? unitLabel : `${unitLabel}(s)`;
  return `${count} ${plural} in ${product.medicineDetails.unit === "STRIP" ? "Strip" : product.medicineDetails.unit}`;
}

function getExplicitDiscountPercent(product: Product): number | undefined {
  if (isMedicineProduct(product) && product.discount != null) {
    return product.discount;
  }

  if (isHealthcareProduct(product)) {
    const variant = getDefaultVariant(product);
    if (variant?.discount != null) {
      return variant.discount;
    }
  }

  return undefined;
}

export function getProductMrp(product: Product): number | undefined {
  if (isMedicineProduct(product)) {
    return product.mrp;
  }

  return getDefaultVariant(product)?.mrp;
}

/**
 * Pricing for UI. When API adds `salePrice`, map it here instead of deriving from discount.
 */
export function getProductPricing(product: Product): ProductPricing | null {
  const mrp = getProductMrp(product);
  if (mrp == null) {
    return null;
  }

  const explicitDiscount = getExplicitDiscountPercent(product);
  const discountPercent =
    explicitDiscount != null && explicitDiscount > 0
      ? explicitDiscount
      : DEFAULT_CATALOG_DISCOUNT_PERCENT;

  const salePrice = roundMoney(mrp * (1 - discountPercent / 100));

  return {
    mrp,
    salePrice,
    discountPercent,
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
    return product.medicineDetails.manufacturer;
  }

  return product.brand;
}

export function getProductPackLabelDisplay(product: Product): string | undefined {
  const label = getProductPackLabel(product);
  return label ? label.toUpperCase() : undefined;
}

/** Per-unit sale price for medicine packs, with tax disclaimer suffix for PDP. */
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

/** Approximate PLUS credits shown on PDP membership strip. */
export function getProductPlusCreditsAmount(product: Product): number {
  const pricing = getProductPricing(product);
  if (!pricing) {
    return 2;
  }

  return Math.max(1, Math.round(pricing.salePrice * 0.08));
}
