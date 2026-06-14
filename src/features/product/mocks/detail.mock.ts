import type { ImageRequireSource } from "react-native";

import { homePromoBannerAssets } from "@/components/home/HomePromoBanner";
import { PDP_SHARE_BRAND_COLORS } from "@/features/product/constants/productDetail.constants";

export const MOCK_DELIVERY_INFO = {
  etaTime: "Tomorrow, 8:00 pm - 10:00 pm",
  pincode: "400001",
  areaLabel: "Mumbai",
} as const;

export const PRODUCT_RETURN_POLICY_DAYS = 15;

export const PRODUCT_DETAIL_OFFER_FOOTNOTE =
  "*Get 26% OFF on orders above Rs.1500. T&C apply.";

export type ProductDetailPromoSlide =
  | { id: string; type: "pain-support" }
  | { id: string; type: "image"; source: ImageRequireSource };

export const PRODUCT_DETAIL_PROMO_SLIDES: readonly ProductDetailPromoSlide[] = [
  { id: "pain-support", type: "pain-support" },
  { id: "medicine-promo", type: "image", source: homePromoBannerAssets.medicine27 },
  { id: "diag-promo", type: "image", source: homePromoBannerAssets.diagBogo },
];

export const PAIN_SUPPORT_BANNER_IMAGE_URI =
  "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg";

export type ProductDetailCarouselKey =
  | "frequentlyBoughtTogether"
  | "customersAlsoViewed"
  | "previouslyBrowsed";

export type ProductDetailCarouselSectionConfig = {
  key: ProductDetailCarouselKey;
  title: string;
  productIds: readonly string[];
};

export const PRODUCT_DETAIL_OFFER_COUPON_IDS: readonly string[] = ["1", "2"];

export type ProductDetailShareChannelId = "whatsapp" | "facebook" | "twitter";

export type ProductDetailShareChannel = {
  id: ProductDetailShareChannelId;
  label: string;
  iconName: "logo-whatsapp" | "logo-facebook" | "logo-twitter";
  backgroundColor: string;
};

export const PRODUCT_DETAIL_SHARE_CHANNELS: readonly ProductDetailShareChannel[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    iconName: "logo-whatsapp",
    backgroundColor: PDP_SHARE_BRAND_COLORS.whatsapp,
  },
  {
    id: "facebook",
    label: "Facebook",
    iconName: "logo-facebook",
    backgroundColor: PDP_SHARE_BRAND_COLORS.facebook,
  },
  {
    id: "twitter",
    label: "Twitter",
    iconName: "logo-twitter",
    backgroundColor: PDP_SHARE_BRAND_COLORS.twitter,
  },
];

export const PRODUCT_DETAIL_DISCLAIMER =
  "The information provided on this page is for educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this app. Pillfly does not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information that may be mentioned on this product page.";

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
];
