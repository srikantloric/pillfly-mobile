const mockGet = jest.fn();

jest.mock("@/services/api/product.client", () => ({
  productClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

import { getStoreProduct, listStoreProducts, searchStoreProducts } from "../api/product.api";
import { PRODUCT_PATHS } from "../api/product.paths";
import { ProductRequestError } from "../utils/productRequestError";

const timestamps = {
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z",
};

const medicineProduct = {
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

describe("product.api", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("lists store products with limit and an opaque cursor", async () => {
    mockGet.mockResolvedValue({
      data: { data: [medicineProduct], nextCursor: "eyJpZCI6InByb2RfMTIzIn0=" },
    });

    const result = await listStoreProducts({
      limit: 20,
      cursor: "eyJpZCI6InByb2RfMTIzIn0=",
    });

    expect(mockGet).toHaveBeenCalledWith(PRODUCT_PATHS.storeList, {
      params: { limit: 20, cursor: "eyJpZCI6InByb2RfMTIzIn0=" },
    });
    expect(result.data[0]?.id).toBe("prod_123");
    expect(result.nextCursor).toBe("eyJpZCI6InByb2RfMTIzIn0=");
  });

  it("does not send a cursor on the first list page", async () => {
    mockGet.mockResolvedValue({ data: { data: [] } });

    const result = await listStoreProducts();

    expect(mockGet).toHaveBeenCalledWith(PRODUCT_PATHS.storeList, {
      params: { limit: 20 },
    });
    expect(result.data).toEqual([]);
    expect(result.nextCursor).toBeUndefined();
  });

  it("fetches a store product by id", async () => {
    mockGet.mockResolvedValue({ data: { data: medicineProduct } });

    const result = await getStoreProduct("prod_123");

    expect(mockGet).toHaveBeenCalledWith("/products/store/prod_123");
    expect(result.data.productType).toBe("MEDICINE");
    expect(result.data.variants[0]?.id).toBe("var_123");
  });

  it("maps detail 404 responses to a product error", async () => {
    mockGet.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "Product doesn't exist" },
      },
    });

    await expect(getStoreProduct("missing")).rejects.toMatchObject({
      name: "ProductRequestError",
      status: 404,
      message: "Product doesn't exist",
    });
  });

  it("searches with page-based pagination metadata", async () => {
    mockGet.mockResolvedValue({
      data: {
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
        ],
        page: 0,
        hitsPerPage: 10,
        nbHits: 1,
        nbPages: 1,
      },
    });

    const result = await searchStoreProducts({ q: " paracetamol ", limit: 10, page: 0 });

    expect(mockGet).toHaveBeenCalledWith(PRODUCT_PATHS.search, {
      params: { q: "paracetamol", limit: 10, page: 0 },
    });
    expect(result.nbPages).toBe(1);
    expect(result.items[0]?.productId).toBe("prod_123");
  });

  it("rejects a negative search page before calling the API", async () => {
    await expect(searchStoreProducts({ page: -1 })).rejects.toBeInstanceOf(ProductRequestError);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("maps network failures to a product error", async () => {
    mockGet.mockRejectedValue({
      request: {},
    });

    await expect(getStoreProduct("prod_123")).rejects.toMatchObject({
      name: "ProductRequestError",
      kind: "network",
    });
  });

  it("rejects a malformed detail envelope", async () => {
    mockGet.mockResolvedValue({ data: { data: { id: "prod_123" } } });

    await expect(getStoreProduct("prod_123")).rejects.toMatchObject({
      name: "ProductRequestError",
      kind: "malformed",
    });
  });

  it("surfaces search service failures", async () => {
    mockGet.mockRejectedValue({
      response: {
        status: 500,
        data: { message: "Search service failed" },
      },
    });

    await expect(searchStoreProducts({ q: "para" })).rejects.toMatchObject({
      message: "Search service failed",
      status: 500,
    });
  });
});
