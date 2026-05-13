import { CATEGORIES } from "@/mocks/categories.mock";

export const categoryService = {
  async getCategories() {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 300),
    );

    return CATEGORIES;
  },
};
