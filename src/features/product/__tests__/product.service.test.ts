const mockGetStoreProduct = jest.fn();
const mockListStoreProducts = jest.fn();
const mockSearchStoreProducts = jest.fn();

jest.mock("../api/product.api", () => ({
  getStoreProduct: (...args: unknown[]) => mockGetStoreProduct(...args),
  listStoreProducts: (...args: unknown[]) => mockListStoreProducts(...args),
  searchStoreProducts: (...args: unknown[]) => mockSearchStoreProducts(...args),
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
    mockSearchStoreProducts.mockReset();
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

    expect(mockListStoreProducts).toHaveBeenCalledWith({
      limit: undefined,
      cursor: undefined,
    });
    expect(products).toHaveLength(1);
    expect(productService.getAllProducts()).toHaveLength(1);
  });

  it("passes an opaque cursor through on the next store page", async () => {
    mockListStoreProducts.mockResolvedValue({
      data: [{ ...medicine, id: "prod_124" }],
      nextCursor: "cursor-2",
    });

    const page = await productService.listStorePage({
      limit: 20,
      cursor: "eyJpZCI6InByb2RfMTIzIn0=",
    });

    expect(mockListStoreProducts).toHaveBeenCalledWith({
      limit: 20,
      cursor: "eyJpZCI6InByb2RfMTIzIn0=",
    });
    expect(page.products[0]?.id).toBe("prod_124");
    expect(page.nextCursor).toBe("cursor-2");
  });

  it("omits nextCursor when the backend has no further page", async () => {
    mockListStoreProducts.mockResolvedValue({ data: [] });

    const page = await productService.listStorePage();

    expect(page.products).toEqual([]);
    expect(page.nextCursor).toBeUndefined();
  });

  it("drops duplicate product ids within a store page", async () => {
    mockListStoreProducts.mockResolvedValue({
      data: [medicine, medicine],
    });

    const page = await productService.listStorePage();

    expect(page.products).toHaveLength(1);
  });

  it("leaves category filtering unimplemented until the backend contract exists", () => {
    expect(productService.getProductsByCategory("health-concerns")).toEqual([]);
  });

  it("searches store products with page metadata", async () => {
    mockSearchStoreProducts.mockResolvedValue({
      items: [
        {
          objectID: "prod_123",
          productId: "prod_123",
          title: "Paracetamol 500 mg",
          slug: "paracetamol-500-mg",
          productType: "MEDICINE",
          brandId: "brand_123",
          brandName: "Example Pharma",
          manufacturerId: "mfr_123",
          manufacturerName: "Example Laboratories",
          sku: ["PCM-500-10"],
          status: "ACTIVE",
        },
        {
          objectID: "prod_123",
          productId: "prod_123",
          title: "Paracetamol 500 mg",
          slug: "paracetamol-500-mg",
          productType: "MEDICINE",
          brandId: "brand_123",
          brandName: "Example Pharma",
          manufacturerId: "mfr_123",
          manufacturerName: "Example Laboratories",
          sku: ["PCM-500-10"],
          status: "ACTIVE",
        },
      ],
      page: 0,
      hitsPerPage: 10,
      nbHits: 1,
      nbPages: 1,
    });

    const page = await productService.searchStorePage({ q: "paracetamol", limit: 10, page: 0 });

    expect(mockSearchStoreProducts).toHaveBeenCalledWith({
      q: "paracetamol",
      limit: 10,
      page: 0,
    });
    expect(page.items).toHaveLength(1);
    expect(page.nbPages).toBe(1);
  });

  it("returns empty search hits without inventing products", async () => {
    mockSearchStoreProducts.mockResolvedValue({
      items: [],
      page: 0,
      hitsPerPage: 0,
      nbHits: 0,
      nbPages: 0,
    });

    const page = await productService.searchStorePage({ q: "unknown" });

    expect(page.items).toEqual([]);
    expect(page.nbPages).toBe(0);
  });
});
