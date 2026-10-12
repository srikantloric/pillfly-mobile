import type { ProductSearchHit } from "../types/storeProduct";
import { hasMoreSearchPages, mergeUniqueHits } from "../utils/mergeUniqueHits";

function hit(productId: string): ProductSearchHit {
  return {
    objectID: productId,
    productId,
    title: productId,
    slug: productId,
    productType: "MEDICINE",
    brandId: "brand",
    brandName: "Brand",
    manufacturerId: "mfr",
    manufacturerName: "Mfr",
    sku: [],
    status: "ACTIVE",
  };
}

describe("search hit pagination helpers", () => {
  it("appends unique product ids only", () => {
    expect(mergeUniqueHits([hit("prod_1")], [hit("prod_1"), hit("prod_2")]).map((item) => item.productId)).toEqual([
      "prod_1",
      "prod_2",
    ]);
  });

  it("stops when there is no further page", () => {
    expect(hasMoreSearchPages(0, 0)).toBe(false);
    expect(hasMoreSearchPages(0, 1)).toBe(false);
    expect(hasMoreSearchPages(0, 2)).toBe(true);
    expect(hasMoreSearchPages(1, 2)).toBe(false);
  });
});
