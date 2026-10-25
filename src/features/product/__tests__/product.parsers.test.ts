import {
  isStoreHealthcare,
  isStoreMedicine,
  parseProductSearchResponse,
  parseStoreProduct,
  parseStoreProductListResponse,
  parseStoreProductResponse,
} from "../api/product.parsers";
import { RequestError } from "@/services/api/requestError";

const timestamps = {
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z",
};

function medicinePayload(overrides: Record<string, unknown> = {}) {
  return {
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
        images: [
          {
            key: "products/prod_123/secondary.jpg",
            url: "https://cdn.example.com/products/secondary.jpg",
            type: "SECONDARY",
            order: 1,
          },
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
    ...overrides,
  };
}

function healthcarePayload() {
  return {
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
        images: [
          {
            key: "products/prod_h1/primary.jpg",
            type: "PRIMARY",
            order: 0,
          },
        ],
        ...timestamps,
      },
    ],
    ...timestamps,
  };
}

describe("store product parsers", () => {
  it("parses a medicine product and keeps variant prices from the backend", () => {
    const product = parseStoreProduct(medicinePayload());
    expect(product).not.toBeNull();
    expect(isStoreMedicine(product!)).toBe(true);
    if (!product || !isStoreMedicine(product)) {
      return;
    }

    expect(product.variantOptions).toEqual([]);
    expect(product.details.prescriptionRequired).toBe(false);
    expect(product.variants[0]?.sellingPrice).toBe(40);
    expect(product.variants[0]!.sellingPrice).toBe(40);
    expect(product.variants[0]?.images.map((image) => image.order)).toEqual([0, 1]);
  });

  it("parses a healthcare product with selectable options and out-of-stock variants", () => {
    const product = parseStoreProduct(healthcarePayload());
    expect(product).not.toBeNull();
    expect(isStoreHealthcare(product!)).toBe(true);
    if (!product || !isStoreHealthcare(product)) {
      return;
    }

    expect(product.variantOptions).toHaveLength(1);
    expect(product.details.shelfLifeInMonths).toBe(24);
    expect(product.variants[0]?.inStock).toBe(false);
    expect(product.variants[0]?.availableQty).toBe(0);
    expect(product.variants[0]?.images[0]?.url).toBeUndefined();
  });

  it("does not derive selling price from MRP and discount", () => {
    const product = parseStoreProduct(
      medicinePayload({
        variants: [
          {
            id: "var_123",
            sku: "PCM-500-10",
            combinationKey: "default",
            isDefault: true,
            status: "ACTIVE",
            mrp: 50,
            sellingDiscount: 20,
            sellingPrice: 12.34,
            availableQty: 1,
            inStock: true,
            images: [],
            ...timestamps,
          },
        ],
      }),
    );

    expect(product?.variants[0]?.sellingPrice).toBe(12.34);
  });

  it("parses list pagination and skips malformed products", () => {
    const parsed = parseStoreProductListResponse({
      data: [medicinePayload(), { id: "broken" }, healthcarePayload()],
      nextCursor: "eyJpZCI6InByb2RfMTIzIn0=",
    });

    expect(parsed.data.map((product) => product.id)).toEqual(["prod_123", "prod_h1"]);
    expect(parsed.nextCursor).toBe("eyJpZCI6InByb2RfMTIzIn0=");
  });

  it("omits nextCursor when the backend does not send one", () => {
    const parsed = parseStoreProductListResponse({ data: [] });
    expect(parsed.data).toEqual([]);
    expect(parsed.nextCursor).toBeUndefined();
  });

  it("parses a detail payload and rejects missing products", () => {
    expect(parseStoreProductResponse({ data: medicinePayload() }).data.id).toBe("prod_123");
    expect(() => parseStoreProductResponse({ data: { id: "prod_123" } })).toThrow(RequestError);
  });

  it("parses search hits and pagination metadata", () => {
    const parsed = parseProductSearchResponse({
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
          thumbnailUrl: "https://cdn.example.com/products/prod_123.jpg",
          sku: ["PCM-500-10"],
          saltComposition: "Paracetamol",
          tags: ["pain relief", "fever"],
          status: "ACTIVE",
        },
        { objectID: "bad" },
      ],
      page: 0,
      hitsPerPage: 10,
      nbHits: 1,
      nbPages: 1,
    });

    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.productId).toBe("prod_123");
    expect(parsed.page).toBe(0);
    expect(parsed.nbPages).toBe(1);
  });

  it("skips products that are not ACTIVE", () => {
    expect(parseStoreProduct(medicinePayload({ status: "INACTIVE" }))).toBeNull();
  });

  it("keeps zero FEFO price and stock values", () => {
    const product = parseStoreProduct(
      medicinePayload({
        variants: [
          {
            id: "var_123",
            sku: "PCM-500-10",
            combinationKey: "default",
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
      }),
    );

    expect(product?.variants[0]).toMatchObject({
      mrp: 0,
      sellingPrice: 0,
      availableQty: 0,
      inStock: false,
    });
    expect(product!.variants[0]!.sellingPrice).toBe(0);
  });

  it("parses an empty search result without inventing hits", () => {
    expect(parseProductSearchResponse({ items: [], nbHits: 0, nbPages: 0 })).toEqual({
      items: [],
      page: 0,
      hitsPerPage: 0,
      nbHits: 0,
      nbPages: 0,
    });
  });
});
