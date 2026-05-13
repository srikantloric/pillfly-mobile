import type { Category, ProductCategory } from "@/types/category.types";

// Single mock list: home grid, category tab, categoryService. Must list every ProductCategory id.
const CATEGORY_SOURCE = [
  {
    id: "ayurvedic-care",
    title: "Ayurvedic Care",
    image: require("../assets/categories/ayurvedic-care.webp"),
    tileBg: "#FFEDD5",
  },
  {
    id: "baby-care",
    title: "Baby Care",
    image: require("../assets/categories/baby-care.webp"),
    tileBg: "#DCFCE7",
  },
  {
    id: "diabetes-essentials",
    title: "Diabetes Essentials",
    image: require("../assets/categories/diabetis-essentials.webp"),
    tileBg: "#FEE2E2",
  },
  {
    id: "healthcare-device",
    title: "Healthcare Devices",
    image: require("../assets/categories/healthcare-device.webp"),
    tileBg: "#FEF3C7",
  },
  {
    id: "health-concerns",
    title: "Health Concerns",
    image: require("../assets/categories/health-concerns.webp"),
    tileBg: "#FEE2E2",
  },
  {
    id: "mobility-elderly",
    title: "Mobility & Elderly Care",
    image: require("../assets/categories/mobility-elderly.webp"),
    tileBg: "#DCFCE7",
  },
  {
    id: "personal-care",
    title: "Personal Care",
    image: require("../assets/categories/personal-care.webp"),
    tileBg: "#FEE2E2",
  },
  {
    id: "pet-care",
    title: "Pet Care",
    image: require("../assets/categories/pet-care.webp"),
    tileBg: "#FEF3C7",
  },
  {
    id: "sexual-wellness",
    title: "Sexual Wellness",
    image: require("../assets/categories/sexual-wellness.webp"),
    tileBg: "#FEE2E2",
  },
  {
    id: "skin-care",
    title: "Skin Care",
    image: require("../assets/categories/skin-care.webp"),
    tileBg: "#DCFCE7",
  },
  {
    id: "must-have",
    title: "Must Have",
    image: require("../assets/categories/must-have.webp"),
    tileBg: "#DCFCE7",
  },
  {
    id: "sports-nutrition",
    title: "Sports Nutrition",
    image: require("../assets/categories/sports-nutrition.webp"),
    tileBg: "#DBEAFE",
  },
  {
    id: "summer-store",
    title: "Summer Store",
    image: require("../assets/categories/summar-store.webp"),
    tileBg: "#FFEDD5",
  },
  {
    id: "vitamin-store",
    title: "Vitamin Store",
    image: require("../assets/categories/vitamin-store.webp"),
    tileBg: "#FEF3C7",
  },
  {
    id: "explore-more",
    title: "Explore More",
    image: require("../assets/categories/explore-more.webp"),
    tileBg: "#F3E8FF",
  },
] as const satisfies ReadonlyArray<Pick<Category, "id" | "title" | "image" | "tileBg">>;

export const CATEGORIES: Category[] = CATEGORY_SOURCE.map((r) => ({
  id: r.id,
  title: r.title,
  image: r.image,
  tileBg: r.tileBg,
}));

type SourceIds = (typeof CATEGORY_SOURCE)[number]["id"];
type MissingProductCategory = Exclude<ProductCategory, SourceIds>;
type _ProductCatalogComplete = [MissingProductCategory] extends [never]
  ? true
  : MissingProductCategory;
const _everyProductCategoryInMock: _ProductCatalogComplete = true;
// eslint-disable-next-line no-void
void _everyProductCategoryInMock;
