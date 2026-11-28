import type { ImageRequireSource } from "react-native";

import { homePromoBannerAssets } from "@/components/ui";

export const RECENT_SEARCHES: readonly string[] = [
  "Flucos Itz Capsules",
  "Dolo 650",
  "Cetirizine",
  "Vitamin C",
  "Accu-Chek Strips",
];

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

export const PREVIOUSLY_BOUGHT_PRODUCT_IDS: readonly string[] = [
  "med-018",
  "med-001",
  "med-005",
  "hlth-006",
];

export const SEARCH_PROMO_BANNER: ImageRequireSource = homePromoBannerAssets.diagBogo;
export const PRODUCT_SEARCH_RATINGS: Readonly<Partial<Record<string, number>>> = {
  "med-001": 4.8,
  "med-018": 4.6,
  "med-016": 4.5,
  "hlth-006": 4.7,
  "hlth-001": 4.4,
};
