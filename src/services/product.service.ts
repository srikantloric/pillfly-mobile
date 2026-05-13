import { mockProducts } from "@/mocks/products.mock";

export const productService = {
  async getProducts() {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 300),
    );

    return mockProducts;
  },
};
