const mockGet = jest.fn();

jest.mock("@/services/api/product.client", () => ({
  productClient: {
    get: (...args: unknown[]) => mockGet(...args),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock("@/features/product/api/product.api", () => ({}));

import type { StoreProduct, StoreProductVariant } from "@/features/product/types/storeProduct";

import { loadReorderProduct, planReorder, type ReorderLine } from "../utils/reorderAvailability";

function variant(overrides: Partial<StoreProductVariant> = {}): StoreProductVariant {
  return {
    id: "var_15",
    sku: "PCM-15",
    combinationKey: "pack-15",
    isDefault: false,
    status: "ACTIVE",
    mrp: 50,
    sellingDiscount: 0,
    sellingPrice: 40,
    availableQty: 10,
    inStock: true,
    images: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function product(variants: StoreProductVariant[]): StoreProduct {
  return { id: "prod_1", status: "ACTIVE", variants } as StoreProduct;
}

const line: ReorderLine = {
  productId: "prod_1",
  variantId: "var_15",
  title: "Paracetamol 15 tablets",
  quantity: 2,
};

describe("planReorder", () => {
  it("adds the original variant when it is active and in stock", () => {
    const plan = planReorder(
      [line],
      [],
      new Map([["prod_1", { kind: "active", product: product([variant(), variant({ id: "var_30", sku: "PCM-30" })]) }]]),
    );

    expect(plan).toEqual({
      additions: [{ productId: "prod_1", variantId: "var_15", quantity: 2 }],
      notices: [],
      openCart: true,
    });
  });

  it("leaves an existing cart line unchanged", () => {
    const plan = planReorder(
      [line],
      [{ productId: "prod_1", variantId: "var_15", quantity: 1 }],
      new Map(),
    );

    expect(plan).toEqual({ additions: [], notices: [], openCart: true });
  });

  it("does not substitute another variant when the ordered variant is missing", () => {
    const plan = planReorder(
      [line],
      [],
      new Map([["prod_1", { kind: "active", product: product([variant({ id: "var_30", isDefault: true })]) }]]),
    );

    expect(plan.additions).toEqual([]);
    expect(plan.notices).toEqual(["Paracetamol 15 tablets is no longer available in that option."]);
    expect(plan.openCart).toBe(false);
  });

  it("skips an inactive variant", () => {
    const plan = planReorder(
      [line],
      [],
      new Map([["prod_1", { kind: "active", product: product([variant({ status: "INACTIVE" })]) }]]),
    );

    expect(plan.additions).toEqual([]);
    expect(plan.notices).toEqual(["Paracetamol 15 tablets is no longer available in that option."]);
  });

  it("names a missing or inactive product and does not add it", () => {
    expect(planReorder([line], [], new Map([["prod_1", { kind: "missing" }]])).notices).toEqual([
      "Paracetamol 15 tablets is no longer available.",
    ]);
    expect(planReorder([line], [], new Map([["prod_1", { kind: "inactive" }]])).additions).toEqual([]);
  });

  it("adds only the available quantity when stock is short", () => {
    const plan = planReorder(
      [line],
      [],
      new Map([["prod_1", { kind: "active", product: product([variant({ availableQty: 1 })]) }]]),
    );

    expect(plan.additions).toEqual([{ productId: "prod_1", variantId: "var_15", quantity: 1 }]);
    expect(plan.notices).toEqual(["Only 1 of Paracetamol 15 tablets was added."]);
    expect(plan.openCart).toBe(true);
  });

  it("skips an out-of-stock variant", () => {
    const plan = planReorder(
      [line],
      [],
      new Map([["prod_1", { kind: "active", product: product([variant({ availableQty: 4, inStock: false })]) }]]),
    );

    expect(plan.additions).toEqual([]);
    expect(plan.notices).toEqual(["Paracetamol 15 tablets is out of stock."]);
    expect(plan.openCart).toBe(false);
  });

  it("keeps the cart closed when availability cannot be checked", () => {
    const plan = planReorder([line], [], new Map([["prod_1", { kind: "unknown" }]]));

    expect(plan).toEqual({
      additions: [],
      notices: ["Couldn't check Paracetamol 15 tablets. It was not added."],
      openCart: false,
    });
  });
});

describe("loadReorderProduct", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("reads the active store product from the detail response", async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          id: "prod_1",
          title: "Paracetamol",
          slug: "paracetamol",
          description: "Pain relief",
          manufacturerId: "mfr_1",
          brandId: "brand_1",
          hsnSacCode: "3004",
          status: "ACTIVE",
          productType: "MEDICINE",
          details: {
            dosageForm: "Tablet",
            unit: "tablet",
            packSize: "15 tablets",
            saltComposition: "Paracetamol",
            uses: "Fever",
            therapy: "Analgesic",
            sideEffects: "Nausea",
            warnings: "Use as directed",
            prescriptionRequired: false,
          },
          variantOptions: [],
          variants: [
            {
              id: "var_15",
              sku: "PCM-15",
              combinationKey: "default",
              isDefault: true,
              status: "ACTIVE",
              mrp: 50,
              sellingDiscount: 0,
              sellingPrice: 40,
              availableQty: 25,
              inStock: true,
              images: [],
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    });

    const result = await loadReorderProduct("prod_1");

    expect(result.kind).toBe("active");
    if (result.kind === "active") {
      expect(result.product.variants[0]).toMatchObject({
        id: "var_15",
        status: "ACTIVE",
        availableQty: 25,
        inStock: true,
      });
    }
  });

  it("treats a non-active product as unavailable", async () => {
    mockGet.mockResolvedValue({ data: { data: { status: "INACTIVE" } } });

    await expect(loadReorderProduct("prod_1")).resolves.toEqual({ kind: "inactive" });
  });

  it("treats a 404 as a missing product", async () => {
    mockGet.mockRejectedValue({ response: { status: 404, data: {} } });

    await expect(loadReorderProduct("prod_1")).resolves.toEqual({ kind: "missing" });
  });
});
