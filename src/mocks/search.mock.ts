import type { ImageRequireSource } from "react-native";

import type { CategoryId } from "@/types/category.types";

import { homePromoBannerAssets } from "../components/home/HomePromoBanner";

/** Display labels for search home horizontal categories (reference layout). */
export const TOP_SEARCH_CATEGORY_TILES: ReadonlyArray<{
  id: CategoryId;
  title: string;
}> = [
  { id: "diabetes-essentials", title: "diabetes" },
  { id: "must-have", title: "Must Haves" },
  { id: "vitamin-store", title: "Vitamin Store" },
  { id: "sexual-wellness", title: "Sexual Wellness" },
];

export const RECENT_SEARCHES: readonly string[] = [
  "Flucos Itz Capsules",
  "Dolo 650",
  "Cetirizine",
  "Vitamin C",
  "Accu-Chek Strips",
];

/** Keyword suggestions shown while typing (filtered by query in search.utils). */
export const SEARCH_KEYWORD_SUGGESTIONS: readonly string[] = [
  "Omez",
  "Omez 20",
  "Omez Dsr",
  "Omezol",
  "Omez Insta",
  "Paracetamol",
  "Dolo 650",
  "Crocin",
  "Cetirizine",
  "Azithral",
  "Digene",
  "Combiflam",
  "Shelcal",
  "Vitamin C",
  "Accu-Chek",
];

/** Product ids for “Previously bought items” — resolved via productService.getProductById. */
export const PREVIOUSLY_BOUGHT_PRODUCT_IDS: readonly string[] = [
  "med-018",
  "med-001",
  "med-005",
  "hlth-006",
];

export const SEARCH_PROMO_BANNER: ImageRequireSource = homePromoBannerAssets.diagBogo;

export const MOCK_CART_SUMMARY = {
  itemCount: 0,
  label: "In cart",
} as const;
