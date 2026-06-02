import type { Product } from "@/types/product";
import { healthcareProducts } from "./products/healthcare.mock";
import { medicineProducts } from "./products/medicines.mock";

export const mockProducts: Product[] = [...medicineProducts, ...healthcareProducts];
