import type { ProductCategory } from "./category.types";

export type ProductType = "MEDICINE" | "HEALTHCARE";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

export type ImageType = {
  url: string;
  type?: "PRIMARY" | "SECONDARY";
  order?: number;
};

export interface TaxDetails {
  hsnCode: string;
  sGstRate: number;
  cGstRate: number;
}

export interface PhysicalLocation {
  warehouse?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
}

export interface BaseProduct {
  id: string;
  productType: ProductType;

  title: string;
  slug: string;
  description?: string;
  brand?: string;
  physicalLocation?: PhysicalLocation;

  tax: TaxDetails;

  status: ProductStatus;

  createdAt: string;
  updatedAt: string;

  categories?: ProductCategory[];
}

export interface MedicineDetails {
  manufacturer: string;
  dosageForm: "TABLET" | "CAPSULE" | "SYRUP" | "INJECTION" | "OTHER";
  unit: "PCS" | "BOX" | "BOTTLE" | "STRIP" | "OTHER";
  packSize: string;

  batches: {
    batchNumber: string;
    expiryDate: string;
    stock: number;
    purchasePrice?: number;
  }[];

  purchasePrice?: number;

  saltComposition: string;
  uses: string;
  contraindications?: string;
  therapy: string;
  sideEffects: string;

  warnings?: string;
  additionalInformation?: string;
  faq?: ReadonlyArray<{ question: string; answer: string }>;
  references?: string;
  prescriptionRequired?: boolean;
}

export interface MedicineProduct extends BaseProduct {
  productType: "MEDICINE";

  mrp: number;
  discount?: number;

  stock: number;

  images: ImageType[];

  sku: string;

  isPrescriptionRequired: boolean;

  medicineDetails: MedicineDetails;
}

export interface HealthcareDetails {
  expiryInfo?: string;
  manufacturerAddress?: string;
  countryOfOrigin?: string;
}

export interface HealthcareProduct extends BaseProduct {
  productType: "HEALTHCARE";

  productDetails?: HealthcareDetails;
  tags?: string[];

  variantOptions: ProductOption[];
  variants: ProductVariant[];
}

export interface ProductOptionValue {
  id: string;
  value: string;
}

export interface ProductOption {
  id: string;
  name: string;

  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;

  optionValueIds: string[];

  combinationKey: string;

  mrp: number;
  purchasePrice?: number;
  sgst?: number;
  cgst?: number;
  rackPercentage?: number;
  discount?: number;

  images: ImageType[];

  sku: string;
  stock: number;

  isDefault?: boolean;
}

export type Product = MedicineProduct | HealthcareProduct;

export interface VariantCombination {
  key: string;
  label: string;
  optionValueIds: string[];
  pairs: Array<{
    optionName: string;
    optionValue: string;
  }>;
}

export interface VariantRowForm {
  sku: string;
  mrp: number;
  purchasePrice: number;
  sgst: number;
  cgst: number;
  rackPercentage: number;
  discount: number;
  stock: number;
}

// Stub until HSN/SAC picker exists
export interface HsnSacFormValues {
  hsnCode: string;
}

export interface HsnSacOption extends HsnSacFormValues {
  label: string;
}

export interface CreateProductPayloadForMedicine extends Omit<
  MedicineProduct,
  "id" | "createdAt" | "updatedAt"
> {}

export interface CreateProductPayloadForHealthcare extends Omit<
  HealthcareProduct,
  "id" | "createdAt" | "updatedAt"
> {}
