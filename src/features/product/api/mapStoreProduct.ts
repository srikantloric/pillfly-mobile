import type {
  HealthcareProduct,
  ImageType,
  MedicineDetails,
  MedicineProduct,
  Product,
  ProductOption,
  ProductVariant,
} from "../types/product";
import type {
  StoreProduct,
  StoreProductVariant,
  StoreProductVariantImage,
} from "../types/storeProduct";
import { isStoreHealthcare, isStoreMedicine } from "./product.parsers";

function mapImage(image: StoreProductVariantImage): ImageType | null {
  if (!image.url) {
    return null;
  }

  return {
    url: image.url,
    type: image.type,
    order: image.order,
  };
}

function mapImages(
  images: StoreProductVariantImage[],
  thumbnailUrl?: string,
): ImageType[] {
  const mapped = images
    .map(mapImage)
    .filter((image): image is ImageType => image != null);

  if (mapped.length > 0) {
    return mapped;
  }

  if (thumbnailUrl) {
    return [{ url: thumbnailUrl, type: "PRIMARY", order: 0 }];
  }

  return [];
}

function defaultVariant(variants: StoreProductVariant[]): StoreProductVariant | undefined {
  return variants.find((variant) => variant.isDefault) ?? variants[0];
}

function mapDosageForm(value: string): MedicineDetails["dosageForm"] {
  const normalized = value.trim().toUpperCase();
  if (
    normalized === "TABLET" ||
    normalized === "CAPSULE" ||
    normalized === "SYRUP" ||
    normalized === "INJECTION" ||
    normalized === "OTHER"
  ) {
    return normalized;
  }

  if (normalized.includes("TABLET")) {
    return "TABLET";
  }
  if (normalized.includes("CAPSULE")) {
    return "CAPSULE";
  }
  if (normalized.includes("SYRUP")) {
    return "SYRUP";
  }
  if (normalized.includes("INJECTION")) {
    return "INJECTION";
  }

  return "OTHER";
}

function mapUnit(value: string): MedicineDetails["unit"] {
  const normalized = value.trim().toUpperCase();
  if (
    normalized === "PCS" ||
    normalized === "BOX" ||
    normalized === "BOTTLE" ||
    normalized === "STRIP" ||
    normalized === "OTHER"
  ) {
    return normalized;
  }

  if (normalized.includes("STRIP")) {
    return "STRIP";
  }
  if (normalized.includes("BOTTLE")) {
    return "BOTTLE";
  }
  if (normalized.includes("BOX")) {
    return "BOX";
  }

  return "OTHER";
}

function optionValueIdsForVariant(
  options: ProductOption[],
  combinationKey: string,
): string[] {
  if (!combinationKey || combinationKey === "default") {
    return [];
  }

  const ids: string[] = [];
  for (const option of options) {
    const matched = option.values.find(
      (value) =>
        combinationKey === value.id ||
        combinationKey.endsWith(`:${value.id}`) ||
        combinationKey.endsWith(`:${value.value}`) ||
        combinationKey.includes(value.id) ||
        combinationKey.includes(value.value),
    );
    if (matched) {
      ids.push(matched.id);
    }
  }

  return ids;
}

function mapVariant(
  variant: StoreProductVariant,
  options: ProductOption[],
  thumbnailUrl?: string,
): ProductVariant {
  return {
    id: variant.id,
    optionValueIds: optionValueIdsForVariant(options, variant.combinationKey),
    combinationKey: variant.combinationKey,
    mrp: variant.mrp,
    discount: variant.sellingDiscount,
    sellingPrice: variant.sellingPrice,
    images: mapImages(variant.images, thumbnailUrl),
    sku: variant.sku,
    stock: variant.availableQty,
    inStock: variant.inStock,
    isDefault: variant.isDefault,
  };
}

export function mapStoreProduct(product: StoreProduct): Product {
  const tax = {
    hsnCode: product.hsnSacCode,
    sGstRate: 0,
    cGstRate: 0,
  };

  if (isStoreMedicine(product)) {
    const variant = defaultVariant(product.variants);
    const mapped: MedicineProduct = {
      id: product.id,
      productType: "MEDICINE",
      title: product.title,
      slug: product.slug,
      description: product.description,
      tax,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      mrp: variant?.mrp ?? 0,
      discount: variant?.sellingDiscount ?? 0,
      sellingPrice: variant?.sellingPrice ?? 0,
      stock: variant?.availableQty ?? 0,
      inStock: variant?.inStock ?? false,
      images: mapImages(variant?.images ?? [], product.thumbnailUrl),
      sku: variant?.sku ?? "",
      isPrescriptionRequired: product.details.prescriptionRequired,
      medicineDetails: {
        manufacturer: "",
        dosageForm: mapDosageForm(product.details.dosageForm),
        unit: mapUnit(product.details.unit),
        packSize: product.details.packSize,
        batches: [],
        saltComposition: product.details.saltComposition,
        uses: product.details.uses,
        therapy: product.details.therapy,
        sideEffects: product.details.sideEffects,
        warnings: product.details.warnings,
        prescriptionRequired: product.details.prescriptionRequired,
      },
    };

    return mapped;
  }

  if (isStoreHealthcare(product)) {
    const variantOptions: ProductOption[] = product.variantOptions.map((option) => ({
      id: option.id,
      name: option.name,
      values: option.values.map((value) => ({ id: value.id, value: value.value })),
    }));

    const mapped: HealthcareProduct = {
      id: product.id,
      productType: "HEALTHCARE",
      title: product.title,
      slug: product.slug,
      description: product.description,
      tax,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variantOptions,
      variants: product.variants.map((variant) =>
        mapVariant(variant, variantOptions, product.thumbnailUrl),
      ),
      productDetails: {
        storageInstructions: product.details.storageInstructions,
        shelfLifeInMonths: product.details.shelfLifeInMonths,
        requiresExpiryTracking: product.details.requiresExpiryTracking,
      },
    };

    return mapped;
  }

  throw new Error("Unsupported store product type");
}
