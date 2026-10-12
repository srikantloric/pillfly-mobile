const mockGetStoreProduct = jest.fn();
const mockListStoreProducts = jest.fn();

jest.mock("../api/product.api", () => ({
  getStoreProduct: (...args: unknown[]) => mockGetStoreProduct(...args),
  listStoreProducts: (...args: unknown[]) => mockListStoreProducts(...args),
}));

import { ProductRequestError } from "../utils/productRequestError";
import { productService, resetProductCache } from "../services/product.service";
import { isMedicineProduct } from "../utils/productDisplay";
import type { StoreMedicineProduct } from "../types/storeProduct";

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
    prescriptionRequired: false,
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
      images: [],
      ...timestamps,
    },
  ],
  ...timestamps,
};

describe("product.service", () => {
  beforeEach(() => {
    resetProductCache();
    mockGetStoreProduct.mockReset();
    mockListStoreProducts.mockReset();
  });

  it("loads detail from the store API and caches it for sync lookup", async () => {
    mockGetStoreProduct.mockResolvedValue({ data: medicine });

    const loaded = await productService.fetchProductById("prod_123");

    expect(mockGetStoreProduct).toHaveBeenCalledWith("prod_123");
    expect(loaded?.id).toBe("prod_123");
    expect(isMedicineProduct(loaded!) && loaded.sellingPrice).toBe(40);
    expect(productService.getProductById("prod_123")?.id).toBe("prod_123");
  });

  it("returns undefined for a 404 without using catalog mocks", async () => {
    mockGetStoreProduct.mockRejectedValue(
      new ProductRequestError("Product not found.", { status: 404, kind: "http" }),
    );

    await expect(productService.fetchProductById("missing")).resolves.toBeUndefined();
    expect(productService.getProductById("missing")).toBeUndefined();
  });

  it("does not hide network errors behind mock products", async () => {
    mockGetStoreProduct.mockRejectedValue(
      new ProductRequestError("Network error. Check your connection and try again.", {
        kind: "network",
      }),
    );

    await expect(productService.fetchProductById("prod_123")).rejects.toMatchObject({
      kind: "network",
    });
    expect(productService.getProductById("prod_123")).toBeUndefined();
  });

  it("lists store products from the API", async () => {
    mockListStoreProducts.mockResolvedValue({ data: [medicine] });

    const products = await productService.getProducts();

    expect(mockListStoreProducts).toHaveBeenCalled();
    expect(products).toHaveLength(1);
    expect(productService.getAllProducts()).toHaveLength(1);
  });

  it("leaves category filtering unimplemented until the backend contract exists", () => {
    expect(productService.getProductsByCategory("health-concerns")).toEqual([]);
  });
});
