export { productService } from "./services/product.service";

export type {
  BaseProduct,
  CreateProductPayloadForHealthcare,
  CreateProductPayloadForMedicine,
  HealthcareDetails,
  HealthcareProduct,
  HsnSacFormValues,
  HsnSacOption,
  ImageType,
  MedicineDetails,
  MedicineProduct,
  PhysicalLocation,
  Product,
  ProductOption,
  ProductOptionValue,
  ProductStatus,
  ProductType,
  ProductVariant,
  TaxDetails,
  VariantCombination,
  VariantRowForm,
} from "./types/product";

export { mockProducts } from "./mocks/catalog/products.mock";

export {
  formatInr,
  getDefaultVariant,
  getProductImages,
  getProductManufacturerLabel,
  getProductMrp,
  getProductPackLabel,
  getProductPackLabelDisplay,
  getProductPlusCreditsAmount,
  getProductPricing,
  getProductRating,
  getProductSaltCompositionDisplay,
  getProductStock,
  getProductTherapeuticClassDisplay,
  getProductUnitPriceDetail,
  getProductImageUrl,
  isHealthcareProduct,
  isMedicineProduct,
  isProductInStock,
} from "./utils/productDisplay";

export type { ProductPricing } from "./utils/productDisplay";

export {
  getProductAccordionSections,
  type ProductAccordionSection,
  type ProductAccordionSectionId,
} from "./utils/productDetailAccordion";

export {
  getProductDetailCarouselSections,
  resolveCarouselProducts,
  type ProductDetailCarouselSection,
} from "./utils/productDetailCarousels";

export { getProductDetailOffers } from "./utils/productDetailOffers";

export {
  getProductMedicalDescription,
  getProductMedicalSections,
  hasProductMedicalContent,
  isMedicineWithMedicalContent,
  MEDICAL_INFO_TABS,
  parseBulletList,
  type MedicalInfoSection,
  type MedicalInfoTab,
  type MedicalInfoTabId,
} from "./utils/productMedicalContent";

export { shareProductOnChannel } from "./utils/shareProduct";

export {
  MOCK_DELIVERY_INFO,
  PAIN_SUPPORT_BANNER_IMAGE_URI,
  PRODUCT_DETAIL_CAROUSEL_SECTIONS,
  PRODUCT_DETAIL_DISCLAIMER,
  PRODUCT_DETAIL_OFFER_COUPON_IDS,
  PRODUCT_DETAIL_OFFER_FOOTNOTE,
  PRODUCT_DETAIL_PROMO_SLIDES,
  PRODUCT_DETAIL_SHARE_CHANNELS,
  PRODUCT_RETURN_POLICY_DAYS,
  type ProductDetailCarouselKey,
  type ProductDetailCarouselSectionConfig,
  type ProductDetailPromoSlide,
  type ProductDetailShareChannel,
  type ProductDetailShareChannelId,
} from "./mocks/detail.mock";

export * from "./constants/productDetail.constants";

export { useMedicalSectionScroll } from "./hooks/useMedicalSectionScroll";
export { useProductDetail } from "./hooks/useProductDetail";
export { useProducts } from "./hooks/useProducts";

export * from "./components";

export { ProductDetailScreen } from "./screens/ProductDetailScreen";
