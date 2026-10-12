import type { MedicineProduct } from "../types/product";
import { mergeUniqueProducts } from "../utils/mergeUniqueProducts";

function medicine(id: string): MedicineProduct {
  return {
    id,
    productType: "MEDICINE",
    title: id,
    slug: id,
    tax: { hsnCode: "3004", sGstRate: 0, cGstRate: 0 },
    status: "ACTIVE",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
    mrp: 50,
    sellingPrice: 40,
    stock: 1,
    inStock: true,
    images: [],
    sku: id,
    isPrescriptionRequired: false,
    medicineDetails: {
      manufacturer: "",
      dosageForm: "TABLET",
      unit: "OTHER",
      packSize: "10 tablets",
      batches: [],
      saltComposition: "Paracetamol",
      uses: "",
      therapy: "",
      sideEffects: "",
      warnings: "",
    },
  };
}

describe("mergeUniqueProducts", () => {
  it("appends new products and skips ids already present", () => {
    const first = medicine("prod_1");
    const duplicate = medicine("prod_1");
    const second = medicine("prod_2");

    expect(mergeUniqueProducts([first], [duplicate, second]).map((product) => product.id)).toEqual([
      "prod_1",
      "prod_2",
    ]);
  });
});
