import type { Product } from "@/features/product/types/product";
import { productService } from "@/features/product/services/product.service";

import { toOrderItems } from "../utils/orderItems";

jest.mock("@/features/product/services/product.service", () => ({
  productService: {
    getProductById: jest.fn(),
  },
}));

const getProductById = productService.getProductById as jest.Mock;

const medicine = {
  id: "prod_med",
  productType: "MEDICINE",
  sku: "PCM-500-10",
  variantId: "var_med",
} as Product;

const healthcare = {
  id: "prod_hc",
  productType: "HEALTHCARE",
  variants: [
    { id: "var_a", sku: "HC-A" },
    { id: "var_b", sku: "HC-B" },
  ],
} as Product;

describe("toOrderItems", () => {
  beforeEach(() => {
    getProductById.mockReset();
  });

  it("uses the medicine variant and SKU already stored on the product", () => {
    getProductById.mockReturnValue(medicine);

    expect(toOrderItems([{ productId: "prod_med", quantity: 2 }])).toEqual([
      { productId: "prod_med", variantId: "var_med", quantity: 2, sku: "PCM-500-10" },
    ]);
  });

  it("uses the healthcare variant selected in the cart", () => {
    getProductById.mockReturnValue(healthcare);

    expect(toOrderItems([{ productId: "prod_hc", variantId: "var_b", quantity: 1 }])).toEqual([
      { productId: "prod_hc", variantId: "var_b", quantity: 1, sku: "HC-B" },
    ]);
  });

  it("returns null when a healthcare line has no variant or the SKU is missing", () => {
    getProductById.mockReturnValue(healthcare);
    expect(toOrderItems([{ productId: "prod_hc", quantity: 1 }])).toBeNull();

    getProductById.mockReturnValue({ ...healthcare, variants: [{ id: "var_a", sku: " " }] });
    expect(toOrderItems([{ productId: "prod_hc", variantId: "var_a", quantity: 1 }])).toBeNull();
  });

  it("returns null when the product is not loaded", () => {
    getProductById.mockReturnValue(undefined);
    expect(toOrderItems([{ productId: "prod_med", quantity: 1 }])).toBeNull();
  });
});
