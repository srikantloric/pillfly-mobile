import type { HealthcareProduct, ProductOption, ProductVariant } from "@/features/product/types/product";

export function isVariantAvailable(variant: ProductVariant): boolean {
  if (variant.inStock === false || variant.stock === 0) {
    return false;
  }

  return variant.stock > 0;
}

export function selectInitialVariant(
  variants: readonly ProductVariant[],
): ProductVariant | undefined {
  const availableDefault = variants.find(
    (variant) => variant.isDefault && isVariantAvailable(variant),
  );
  if (availableDefault) {
    return availableDefault;
  }

  const available = variants.find((variant) => isVariantAvailable(variant));
  if (available) {
    return available;
  }

  return variants.find((variant) => variant.isDefault) ?? variants[0];
}

export function variantMatchesOptionValue(variant: ProductVariant, valueId: string): boolean {
  return variant.combinationKey === valueId || variant.optionValueIds.includes(valueId);
}

export function findVariantForOptionValue(
  variants: readonly ProductVariant[],
  valueId: string,
): ProductVariant | undefined {
  return variants.find((variant) => variantMatchesOptionValue(variant, valueId));
}

export function getSelectedOptionLabel(
  product: HealthcareProduct,
  variant: ProductVariant,
): { name: string; value: string } | undefined {
  for (const option of product.variantOptions) {
    const value = option.values.find((item) => variantMatchesOptionValue(variant, item.id));
    if (value) {
      return { name: option.name, value: value.value };
    }
  }

  return undefined;
}

export function countOtherOptionValues(options: readonly ProductOption[]): number {
  const total = options.reduce((sum, option) => sum + option.values.length, 0);
  return Math.max(0, total - 1);
}
