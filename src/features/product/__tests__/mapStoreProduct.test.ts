import { mapStoreProduct } from "../api/mapStoreProduct";
import { isHealthcareProduct, isMedicineProduct } from "../utils/productDisplay";
import type { StoreHealthcareProduct, StoreMedicineProduct } from "../types/storeProduct";

const timestamps = {
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z",
};

const medicine: StoreMedicineProduct = {
  id: "prod_123",
  title: "Paracetamol 500 mg",
  slug: "paracetamol-500-mg",
  description: "Pain and fever relief",
  manufacturerId: "mfr_123",
  brandId: "brand_123",
  hsnSacCode: "3004",
  status: "ACTIVE",
  thumbnailUrl: "https://cdn.example.com/products/prod_123.jpg",
  productType: "MEDICINE",
  details: {
    dosageForm: "Tablet",
    unit: "tablet",
    packSize: "10 tablets",
    saltComposition: "Paracetamol",
    uses: "Fever and pain relief",
    therapy: "Analgesic",
    sideEffects: "Nausea",
    warnings: "Use as directed",
    prescriptionRequired: true,
  },
  variantOptions: [],
  variants: [
    {
      id: "var_123",
      sku: "PCM-500-10",
      combinationKey: "default",
      isDefault: true,
      status: "ACTIVE",
      mrp: 50,
      sellingDiscount: 20,
      sellingPrice: 40,
      availableQty: 25,
      inStock: true,
      images: [
        {
          key: "products/prod_123/primary.jpg",
          url: "https://cdn.example.com/products/primary.jpg",
          type: "PRIMARY",
          order: 0,
        },
      ],
      ...timestamps,
    },
  ],
  ...timestamps,
};

const healthcare: StoreHealthcareProduct = {
  id: "prod_h1",
  title: "Neem Face Wash",
  slug: "neem-face-wash",
  description: "Daily cleanser",
  manufacturerId: "mfr_9",
  brandId: "brand_9",
  hsnSacCode: "3304",
  status: "ACTIVE",
  productType: "HEALTHCARE",
  details: {
    requiresExpiryTracking: true,
    storageInstructions: "Store in a cool dry place",
    shelfLifeInMonths: 24,
  },
  variantOptions: [
    {
      id: "size",
      name: "Size",
      values: [
        { id: "50ml", value: "50ml" },
        { id: "100ml", value: "100ml" },
      ],
    },
  ],
  variants: [
    {
      id: "var_h1",
      sku: "NFW-50",
      combinationKey: "size:50ml",
      isDefault: true,
      status: "ACTIVE",
      mrp: 0,
      sellingDiscount: 20,
      sellingPrice: 0,
      availableQty: 0,
      inStock: false,
      images: [],
      ...timestamps,
    },
  ],
  ...timestamps,
};

describe("mapStoreProduct", () => {
  it("maps medicine variant price and stock onto the product used by screens", () => {
    const product = mapStoreProduct(medicine);
    expect(isMedicineProduct(product)).toBe(true);
    if (!isMedicineProduct(product)) {
      return;
    }

    expect(product.id).toBe("prod_123");
    expect(product.mrp).toBe(50);
    expect(product.discount).toBe(20);
    expect(product.sellingPrice).toBe(40);
    expect(product.stock).toBe(25);
    expect(product.inStock).toBe(true);
    expect(product.isPrescriptionRequired).toBe(true);
    expect(product.medicineDetails.dosageForm).toBe("TABLET");
    expect(product.medicineDetails.packSize).toBe("10 tablets");
    expect(product.images[0]?.url).toBe("https://cdn.example.com/products/primary.jpg");
  });

  it("maps healthcare options, combination keys, and out-of-stock variants", () => {
    const product = mapStoreProduct(healthcare);
    expect(isHealthcareProduct(product)).toBe(true);
    if (!isHealthcareProduct(product)) {
      return;
    }

    expect(product.variants[0]?.id).toBe("var_h1");
    expect(product.variants[0]?.optionValueIds).toEqual(["50ml"]);
    expect(product.variants[0]?.sellingPrice).toBe(0);
    expect(product.variants[0]?.inStock).toBe(false);
    expect(product.variants[0]?.stock).toBe(0);
    expect(product.productDetails?.shelfLifeInMonths).toBe(24);
  });

  it("falls back to thumbnail when variant images have no url", () => {
    const product = mapStoreProduct({
      ...medicine,
      variants: [
        {
          ...medicine.variants[0]!,
          images: [{ key: "missing", type: "PRIMARY", order: 0 }],
        },
      ],
    });

    expect(isMedicineProduct(product) && product.images[0]?.url).toBe(
      "https://cdn.example.com/products/prod_123.jpg",
    );
  });
});
