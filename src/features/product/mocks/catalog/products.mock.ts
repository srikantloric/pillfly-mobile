import { medicineProducts } from "./medicines.mock";
import { healthcareProducts } from "./healthcare.mock";

import type { Product } from "@/features/product/types/product";

export const mockProducts: Product[] = [
  ...medicineProducts,
  ...healthcareProducts,
];