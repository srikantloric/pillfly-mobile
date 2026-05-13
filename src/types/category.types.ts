import type { ImageSourcePropType } from "react-native";

export type ProductCategory =
  | "ayurvedic-care"
  | "baby-care"
  | "diabetes-essentials"
  | "healthcare-device"
  | "health-concerns"
  | "mobility-elderly"
  | "personal-care"
  | "pet-care"
  | "sexual-wellness"
  | "skin-care"
  | "sports-nutrition"
  | "vitamin-store";

export type PromoCategoryId = "must-have" | "summer-store" | "explore-more";

export type CategoryId = ProductCategory | PromoCategoryId;

export interface Category {
  id: CategoryId;
  title: string;
  image: ImageSourcePropType;
  tileBg: string;
  subtitle?: string;
  description?: string;
}
