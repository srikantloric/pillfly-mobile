import { medicineProducts } from "./medicines.mock";
import { healthcareProducts } from "./healthcare.mock";

import type { Product } from "@/types/product";

export const mockProducts: Product[] = [
  ...medicineProducts,
  ...healthcareProducts,
];