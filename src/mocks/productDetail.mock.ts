import type { ImageRequireSource } from "react-native";

import { homePromoBannerAssets } from "@/components/home/HomePromoBanner";

export const MOCK_DELIVERY_INFO = {
  etaLabel: "Delivery by Tomorrow, 10 PM",
  subtitle: "Order within 2 hrs 14 mins",
  pincode: "400001",
  areaLabel: "Mumbai",
} as const;

export const PRODUCT_RETURN_POLICY_DAYS = 15;

export type ProductDetailPromoSlide =
  | { id: string; type: "pain-support" }
  | { id: string; type: "image"; source: ImageRequireSource };

export const PRODUCT_DETAIL_PROMO_SLIDES: readonly ProductDetailPromoSlide[] = [
  { id: "pain-support", type: "pain-support" },
  { id: "medicine-promo", type: "image", source: homePromoBannerAssets.medicine27 },
  { id: "diag-promo", type: "image", source: homePromoBannerAssets.diagBogo },
];

/** Lifestyle background for pain-support PDP promo (reference banner). */
export const PAIN_SUPPORT_BANNER_IMAGE_URI =
  "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg";

export type ProductDetailCarouselKey =
  | "frequentlyBoughtTogether"
  | "customersAlsoViewed"
  | "previouslyBrowsed"
  | "recommendedForYou";

export type ProductDetailCarouselSectionConfig = {
  key: ProductDetailCarouselKey;
  title: string;
  productIds: readonly string[];
};

export const PRODUCT_DETAIL_CAROUSEL_SECTIONS: readonly ProductDetailCarouselSectionConfig[] = [
  {
    key: "frequentlyBoughtTogether",
    title: "FREQUENTLY BOUGHT TOGETHER",
    productIds: ["hlth-007", "hlth-006", "med-001", "med-003", "hlth-002"],
  },
  {
    key: "customersAlsoViewed",
    title: "CUSTOMERS ALSO VIEWED",
    productIds: ["med-003", "med-018", "med-016", "hlth-001", "hlth-004"],
  },
  {
    key: "previouslyBrowsed",
    title: "PREVIOUSLY BROWSED",
    productIds: ["med-018", "med-001", "med-005", "hlth-006", "med-002"],
  },
  {
    key: "recommendedForYou",
    title: "RECOMMENDED FOR YOU",
    productIds: ["med-016", "hlth-003", "med-004", "hlth-008", "med-012"],
  },
];
