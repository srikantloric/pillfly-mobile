/**
 * Scrollable body sections for ProductDetailScreen (top → bottom).
 * Header and Sticky Bottom Cart Bar are rendered outside the ScrollView.
 */
export const PRODUCT_DETAIL_SCROLL_SECTIONS = [
  "Product Image Carousel",
  "Product Information Card",
  "Membership Banner",
  "Delivery Information",
  "Return Policy",
  "Composition Section",
  "Therapeutic Classification",
  "Promotional Banner",
  "Frequently Bought Together",
  "Medical Description",
  "Information Tabs",
  "Uses",
  "Contraindications",
  "Side Effects",
  "Precautions & Warnings",
  "Additional Information",
  "FAQ",
  "References",
  "Product Details",
  "Customers Also Viewed",
  "Recommended For You",
  "Previously Browsed",
  "Offers",
  "Share With Friends",
  "Disclaimer",
] as const;

export type ProductDetailScrollSection = (typeof PRODUCT_DETAIL_SCROLL_SECTIONS)[number];
