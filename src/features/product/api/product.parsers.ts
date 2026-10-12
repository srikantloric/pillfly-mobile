import type {
  ProductImageType,
  ProductSearchHit,
  ProductSearchResponse,
  ProductVariantOption,
  ProductVariantOptionValue,
  StoreHealthcareDetails,
  StoreHealthcareProduct,
  StoreMedicineDetails,
  StoreMedicineProduct,
  StoreProduct,
  StoreProductListResponse,
  StoreProductResponse,
  StoreProductVariant,
  StoreProductVariantImage,
  VariantStatus,
} from "../types/storeProduct";
import { ProductRequestError } from "../utils/productRequestError";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function malformed(message = "Unexpected response from server."): ProductRequestError {
  return new ProductRequestError(message, { kind: "malformed" });
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function requiredText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function optionalString(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  return typeof value === "string" && value.trim() ? value : undefined;
}

function requiredNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function requiredBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function requiredStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      return null;
    }
    items.push(item);
  }

  return items;
}

export function sortStoreProductImages(
  images: StoreProductVariantImage[],
): StoreProductVariantImage[] {
  return [...images].sort((left, right) => left.order - right.order);
}

export function isStoreMedicine(
  product: StoreProduct,
): product is StoreMedicineProduct {
  return product.productType === "MEDICINE";
}

export function isStoreHealthcare(
  product: StoreProduct,
): product is StoreHealthcareProduct {
  return product.productType === "HEALTHCARE";
}

export function getDisplayedPrice(variant: StoreProductVariant): number {
  return variant.sellingPrice;
}

function parseImageType(value: unknown): ProductImageType | null {
  if (value === "PRIMARY" || value === "SECONDARY") {
    return value;
  }

  return null;
}

function parseVariantStatus(value: unknown): VariantStatus | null {
  if (value === "ACTIVE" || value === "INACTIVE") {
    return value;
  }

  return null;
}

function parseVariantImage(value: unknown): StoreProductVariantImage | null {
  if (!isRecord(value)) {
    return null;
  }

  const key = requiredString(value.key);
  const type = parseImageType(value.type);
  const order = requiredNumber(value.order);

  if (!key || !type || order == null) {
    return null;
  }

  const image: StoreProductVariantImage = { key, type, order };
  const url = optionalString(value.url);
  if (url) {
    image.url = url;
  }

  return image;
}

function parseVariant(value: unknown): StoreProductVariant | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = requiredString(value.id);
  const sku = requiredString(value.sku);
  const combinationKey = requiredString(value.combinationKey);
  const isDefault = requiredBoolean(value.isDefault);
  const status = parseVariantStatus(value.status);
  const mrp = requiredNumber(value.mrp);
  const sellingDiscount = requiredNumber(value.sellingDiscount);
  const sellingPrice = requiredNumber(value.sellingPrice);
  const availableQty = requiredNumber(value.availableQty);
  const inStock = requiredBoolean(value.inStock);
  const createdAt = requiredString(value.createdAt);
  const updatedAt = requiredString(value.updatedAt);

  if (
    !id ||
    !sku ||
    !combinationKey ||
    isDefault == null ||
    !status ||
    mrp == null ||
    sellingDiscount == null ||
    sellingPrice == null ||
    availableQty == null ||
    inStock == null ||
    !createdAt ||
    !updatedAt ||
    !Array.isArray(value.images)
  ) {
    return null;
  }

  const images = value.images
    .map(parseVariantImage)
    .filter((image): image is StoreProductVariantImage => image != null);

  return {
    id,
    sku,
    combinationKey,
    isDefault,
    status,
    mrp,
    sellingDiscount,
    sellingPrice,
    availableQty,
    inStock,
    images: sortStoreProductImages(images),
    createdAt,
    updatedAt,
  };
}

function parseOptionValue(value: unknown): ProductVariantOptionValue | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = requiredString(value.id);
  const optionValue = requiredString(value.value);
  if (!id || !optionValue) {
    return null;
  }

  return { id, value: optionValue };
}

function parseVariantOption(value: unknown): ProductVariantOption | null {
  if (!isRecord(value) || !Array.isArray(value.values)) {
    return null;
  }

  const id = requiredString(value.id);
  const name = requiredString(value.name);
  if (!id || !name) {
    return null;
  }

  const values = value.values
    .map(parseOptionValue)
    .filter((item): item is ProductVariantOptionValue => item != null);

  return { id, name, values };
}

function parseMedicineDetails(value: unknown): StoreMedicineDetails | null {
  if (!isRecord(value)) {
    return null;
  }

  const dosageForm = requiredString(value.dosageForm);
  const unit = requiredString(value.unit);
  const packSize = requiredText(value.packSize);
  const saltComposition = requiredText(value.saltComposition);
  const uses = requiredText(value.uses);
  const therapy = requiredText(value.therapy);
  const sideEffects = requiredText(value.sideEffects);
  const warnings = requiredText(value.warnings);
  const prescriptionRequired = requiredBoolean(value.prescriptionRequired);

  if (
    !dosageForm ||
    !unit ||
    packSize == null ||
    saltComposition == null ||
    uses == null ||
    therapy == null ||
    sideEffects == null ||
    warnings == null ||
    prescriptionRequired == null
  ) {
    return null;
  }

  return {
    dosageForm,
    unit,
    packSize,
    saltComposition,
    uses,
    therapy,
    sideEffects,
    warnings,
    prescriptionRequired,
  };
}

function parseHealthcareDetails(value: unknown): StoreHealthcareDetails | null {
  if (!isRecord(value)) {
    return null;
  }

  const requiresExpiryTracking = requiredBoolean(value.requiresExpiryTracking);
  const storageInstructions = requiredText(value.storageInstructions);
  const shelfLifeInMonths = requiredNumber(value.shelfLifeInMonths);

  if (requiresExpiryTracking == null || storageInstructions == null || shelfLifeInMonths == null) {
    return null;
  }

  return {
    requiresExpiryTracking,
    storageInstructions,
    shelfLifeInMonths,
  };
}

function parseBaseFields(value: Record<string, unknown>) {
  const id = requiredString(value.id);
  const title = requiredString(value.title);
  const slug = requiredString(value.slug);
  const description = requiredText(value.description);
  const manufacturerId = requiredString(value.manufacturerId);
  const brandId = requiredString(value.brandId);
  const hsnSacCode = requiredString(value.hsnSacCode);
  const createdAt = requiredString(value.createdAt);
  const updatedAt = requiredString(value.updatedAt);

  if (
    !id ||
    !title ||
    !slug ||
    description == null ||
    !manufacturerId ||
    !brandId ||
    !hsnSacCode ||
    value.status !== "ACTIVE" ||
    !createdAt ||
    !updatedAt ||
    !Array.isArray(value.variants)
  ) {
    return null;
  }

  const variants = value.variants
    .map(parseVariant)
    .filter((variant): variant is StoreProductVariant => variant != null);

  return {
    id,
    title,
    slug,
    description,
    manufacturerId,
    brandId,
    hsnSacCode,
    status: "ACTIVE" as const,
    thumbnailKey: optionalString(value.thumbnailKey),
    thumbnailUrl: optionalString(value.thumbnailUrl),
    variants,
    createdAt,
    updatedAt,
  };
}

export function parseStoreProduct(value: unknown): StoreProduct | null {
  if (!isRecord(value)) {
    return null;
  }

  const base = parseBaseFields(value);
  if (!base) {
    return null;
  }

  if (value.productType === "MEDICINE") {
    const details = parseMedicineDetails(value.details);
    if (!details) {
      return null;
    }

    const product: StoreMedicineProduct = {
      ...base,
      productType: "MEDICINE",
      details,
      variantOptions: [],
    };

    return product;
  }

  if (value.productType === "HEALTHCARE") {
    const details = parseHealthcareDetails(value.details);
    if (!details || !Array.isArray(value.variantOptions)) {
      return null;
    }

    const variantOptions = value.variantOptions
      .map(parseVariantOption)
      .filter((option): option is ProductVariantOption => option != null);

    const product: StoreHealthcareProduct = {
      ...base,
      productType: "HEALTHCARE",
      details,
      variantOptions,
    };

    return product;
  }

  return null;
}

export function parseStoreProductResponse(data: unknown): StoreProductResponse {
  if (!isRecord(data)) {
    throw malformed();
  }

  const product = parseStoreProduct(data.data);
  if (!product) {
    throw malformed();
  }

  return { data: product };
}

export function parseStoreProductListResponse(data: unknown): StoreProductListResponse {
  if (!isRecord(data) || !Array.isArray(data.data)) {
    throw malformed();
  }

  const products = data.data
    .map(parseStoreProduct)
    .filter((product): product is StoreProduct => product != null);

  const response: StoreProductListResponse = { data: products };
  const nextCursor = optionalString(data.nextCursor);
  if (nextCursor) {
    response.nextCursor = nextCursor;
  }

  return response;
}

function parseSearchHit(value: unknown): ProductSearchHit | null {
  if (!isRecord(value)) {
    return null;
  }

  const objectID = requiredString(value.objectID);
  const productId = requiredString(value.productId);
  const title = requiredString(value.title);
  const slug = requiredString(value.slug);
  const brandId = requiredString(value.brandId);
  const brandName = requiredString(value.brandName);
  const manufacturerId = requiredString(value.manufacturerId);
  const manufacturerName = requiredString(value.manufacturerName);
  const sku = requiredStringArray(value.sku);

  if (
    !objectID ||
    !productId ||
    !title ||
    !slug ||
    (value.productType !== "MEDICINE" && value.productType !== "HEALTHCARE") ||
    !brandId ||
    !brandName ||
    !manufacturerId ||
    !manufacturerName ||
    !sku ||
    value.status !== "ACTIVE"
  ) {
    return null;
  }

  const hit: ProductSearchHit = {
    objectID,
    productId,
    title,
    slug,
    productType: value.productType,
    brandId,
    brandName,
    manufacturerId,
    manufacturerName,
    sku,
    status: "ACTIVE",
  };

  const thumbnailUrl = optionalString(value.thumbnailUrl);
  if (thumbnailUrl) {
    hit.thumbnailUrl = thumbnailUrl;
  }

  const saltComposition = optionalString(value.saltComposition);
  if (saltComposition) {
    hit.saltComposition = saltComposition;
  }

  if (Array.isArray(value.tags)) {
    const tags = requiredStringArray(value.tags);
    if (tags) {
      hit.tags = tags;
    }
  }

  return hit;
}

export function parseProductSearchResponse(data: unknown): ProductSearchResponse {
  if (!isRecord(data) || !Array.isArray(data.items)) {
    throw malformed();
  }

  const items = data.items
    .map(parseSearchHit)
    .filter((item): item is ProductSearchHit => item != null);

  const nbHits = requiredNumber(data.nbHits);
  const nbPages = requiredNumber(data.nbPages);

  if (nbHits == null || nbPages == null) {
    if (items.length === 0) {
      return {
        items: [],
        page: requiredNumber(data.page) ?? 0,
        hitsPerPage: requiredNumber(data.hitsPerPage) ?? 0,
        nbHits: 0,
        nbPages: 0,
      };
    }

    throw malformed();
  }

  return {
    items,
    page: requiredNumber(data.page) ?? 0,
    hitsPerPage: requiredNumber(data.hitsPerPage) ?? items.length,
    nbHits,
    nbPages,
  };
}
