export {
  MOCK_CART_SUMMARY,
  PREVIOUSLY_BOUGHT_PRODUCT_IDS,
  PRODUCT_SEARCH_RATINGS,
  RECENT_SEARCHES,
  SEARCH_KEYWORD_SUGGESTIONS,
  SEARCH_PROMO_BANNER,
  TOP_SEARCH_CATEGORY_TILES,
} from "./mocks/search.mock";

export {
  getDiscountPercent,
  getKeywordSuggestions,
  getPreviouslyBoughtProducts,
  getProductSuggestions,
  getResultsForSearch,
  getUnitPriceLabel,
} from "./utils/search.utils";

export {
  formatInr,
  getProductImageUrl,
  getProductMrp,
  getProductPackLabel,
  getProductPricing,
  getProductRating,
  getProductStock,
  isMedicineProduct,
  isProductInStock,
} from "./utils/search.utils";

export * from "./components";

export { SearchHomeScreen } from "./screens/SearchHomeScreen";
export { SearchResultsScreen } from "./screens/SearchResultsScreen";
