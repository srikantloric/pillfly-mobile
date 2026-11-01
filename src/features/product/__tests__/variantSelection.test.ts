import type { HealthcareProduct, ProductVariant } from "@/features/product/types/product";

import {
  findVariantForOptionValue,
  isVariantAvailable,
  selectInitialVariant,
} from "../utils/variantSelection";

function variant(overrides: Partial<ProductVariant> & Pick<ProductVariant, "id">): ProductVariant {
  return {
    sku: overrides.id,
    combinationKey: overrides.id,
    optionValueIds: [overrides.id],
    isDefault: false,
    mrp: 50,
    sellingPrice: 50,
    discount: 0,
    stock: 10,
    inStock: true,
    images: [],
    ...overrides,
  };
}

const product = {
  productType: "HEALTHCARE",
  variantOptions: [
    {
      id: "pack",
      name: "Pack Size",
      values: [
        { id: "60g", value: "60G" },
        { id: "100g", value: "100G" },
      ],
    },
  ],
  variants: [
    variant({
      id: "sixty",
      combinationKey: "60g",
      optionValueIds: ["60g"],
      isDefault: true,
      mrp: 50,
      sellingPrice: 50,
      stock: 25,
    }),
    variant({
      id: "hundred",
      combinationKey: "100g",
      optionValueIds: ["100g"],
      isDefault: false,
      mrp: 0,
      sellingPrice: 0,
      stock: 0,
      inStock: false,
    }),
  ],
} as HealthcareProduct;

describe("variant selection", () => {
  it("selects the available default variant and leaves the zero-price variant unavailable", () => {
    const selected = selectInitialVariant(product.variants);

    expect(selected?.id).toBe("sixty");
    expect(isVariantAvailable(product.variants[1]!)).toBe(false);
    expect(findVariantForOptionValue(product.variants, "100g")?.sellingPrice).toBe(0);
    expect(findVariantForOptionValue(product.variants, "60g")?.id).toBe("sixty");
  });

  it("falls back to the first available variant when the default cannot be purchased", () => {
    const selected = selectInitialVariant([
      variant({ id: "default-out", isDefault: true, stock: 0, inStock: false, mrp: 0, sellingPrice: 0 }),
      variant({ id: "available", isDefault: false, stock: 4, sellingPrice: 80, mrp: 100 }),
    ]);

    expect(selected?.id).toBe("available");
  });
});
