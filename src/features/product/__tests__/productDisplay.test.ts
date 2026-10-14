import type { HealthcareProduct, MedicineProduct } from "../types/product";
import {
  getProductPackLabel,
  getProductPricing,
  isProductInStock,
} from "../utils/productDisplay";

const medicine = (overrides: Partial<MedicineProduct> = {}): MedicineProduct => ({
  id: "prod_123",
  productType: "MEDICINE",
  title: "Paracetamol 500 mg",
  slug: "paracetamol-500-mg",
  tax: { hsnCode: "3004", sGstRate: 0, cGstRate: 0 },
  status: "ACTIVE",
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z",
  mrp: 50,
  discount: 20,
  sellingPrice: 40,
  stock: 25,
  inStock: true,
  images: [],
  sku: "PCM-500-10",
  isPrescriptionRequired: false,
  medicineDetails: {
    manufacturer: "",
    dosageForm: "TABLET",
    unit: "OTHER",
    packSize: "10 tablets",
    batches: [],
    saltComposition: "Paracetamol",
    uses: "Fever",
    therapy: "Analgesic",
    sideEffects: "Nausea",
    warnings: "Use as directed",
  },
  ...overrides,
});

const healthcareOos = (): HealthcareProduct => ({
  id: "prod_h1",
  productType: "HEALTHCARE",
  title: "Neem Face Wash",
  slug: "neem-face-wash",
  tax: { hsnCode: "3304", sGstRate: 0, cGstRate: 0 },
  status: "ACTIVE",
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z",
  variantOptions: [],
  variants: [
    {
      id: "var_h1",
      optionValueIds: [],
      combinationKey: "default",
      mrp: 0,
      discount: 20,
      sellingPrice: 0,
      images: [],
      sku: "NFW-50",
      stock: 0,
      inStock: false,
      isDefault: true,
    },
  ],
});

describe("product display pricing and stock", () => {
  it("does not apply a frontend catalog discount when sellingPrice is present", () => {
    const pricing = getProductPricing(
      medicine({
        mrp: 50,
        discount: 0,
        sellingPrice: 50,
      }),
    );

    expect(pricing).toEqual({ mrp: 50, salePrice: 50, discountPercent: 0 });
  });

  it("uses backend sellingPrice instead of calculating a catalog default", () => {
    expect(getProductPricing(medicine())).toEqual({
      mrp: 50,
      salePrice: 40,
      discountPercent: 20,
    });
  });

  it("keeps a zero selling price when no FEFO batch is available", () => {
    expect(
      getProductPricing(
        medicine({
          mrp: 0,
          discount: 20,
          sellingPrice: 0,
          stock: 0,
          inStock: false,
        }),
      ),
    ).toEqual({
      mrp: 0,
      salePrice: 0,
      discountPercent: 20,
    });
  });

  it("disables purchase when inStock is false or quantity is 0", () => {
    expect(isProductInStock(medicine())).toBe(true);
    expect(isProductInStock(medicine({ inStock: false, stock: 4 }))).toBe(false);
    expect(isProductInStock(medicine({ inStock: true, stock: 0 }))).toBe(false);
    expect(isProductInStock(healthcareOos())).toBe(false);
  });

  it("shows the backend pack size", () => {
    expect(getProductPackLabel(medicine())).toBe("10 tablets");
  });
});
