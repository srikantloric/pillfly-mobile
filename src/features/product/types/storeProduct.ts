export type ProductType = "MEDICINE" | "HEALTHCARE";

export type ProductStatus = "ACTIVE";

export type VariantStatus = "ACTIVE" | "INACTIVE";

export type ProductImageType = "PRIMARY" | "SECONDARY";

export interface StoreProductVariantImage {
  key: string;
  url?: string;
  type: ProductImageType;
  order: number;
}

export interface StoreProductVariant {
  id: string;
  sku: string;
  combinationKey: string;
  isDefault: boolean;
  status: VariantStatus;
  mrp: number;
  sellingDiscount: number;
  sellingPrice: number;
  availableQty: number;
  inStock: boolean;
  images: StoreProductVariantImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantOptionValue {
  id: string;
  value: string;
}

export interface ProductVariantOption {
  id: string;
  name: string;
  values: ProductVariantOptionValue[];
}

export interface StoreProductBase {
  id: string;
  title: string;
  slug: string;
  description: string;
  manufacturerId: string;
  brandId: string;
  hsnSacCode: string;
  status: ProductStatus;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  variants: StoreProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreMedicineDetails {
  dosageForm: string;
  unit: string;
  packSize: string;
  saltComposition: string;
  uses: string;
  therapy: string;
  sideEffects: string;
  warnings: string;
  prescriptionRequired: boolean;
}

export interface StoreHealthcareDetails {
  requiresExpiryTracking: boolean;
  storageInstructions: string;
  shelfLifeInMonths: number;
}

export interface StoreMedicineProduct extends StoreProductBase {
  productType: "MEDICINE";
  details: StoreMedicineDetails;
  variantOptions: [];
  variants: StoreProductVariant[];
}

export interface StoreHealthcareProduct extends StoreProductBase {
  productType: "HEALTHCARE";
  details: StoreHealthcareDetails;
  variantOptions: ProductVariantOption[];
  variants: StoreProductVariant[];
}

export type StoreProduct = StoreMedicineProduct | StoreHealthcareProduct;

export interface StoreProductListResponse {
  data: StoreProduct[];
  nextCursor?: string;
}

export interface StoreProductResponse {
  data: StoreProduct;
}

export interface ProductSearchHit {
  objectID: string;
  productId: string;
  title: string;
  slug: string;
  productType: ProductType;
  brandId: string;
  brandName: string;
  manufacturerId: string;
  manufacturerName: string;
  thumbnailUrl?: string;
  sku: string[];
  saltComposition?: string;
  tags?: string[];
  status: "ACTIVE";
}

export interface ProductSearchResponse {
  items: ProductSearchHit[];
  page: number;
  hitsPerPage: number;
  nbHits: number;
  nbPages: number;
}

export interface ListStoreProductsParams {
  limit?: number;
  cursor?: string;
}

export interface SearchStoreProductsParams {
  q?: string;
  limit?: number;
  page?: number;
}
