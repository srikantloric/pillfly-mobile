import type { HealthcareProduct, MedicineProduct, Product } from "@/types/product";
import { getDefaultVariant, isHealthcareProduct, isMedicineProduct } from "@/utils/productDisplay";

import { createSingleEntryCache } from "./productDetailBuilders.cache";
import { parseBulletList } from "./productMedicalContent";

const accordionSectionsCache = createSingleEntryCache<string, ProductAccordionSection[]>();

export type ProductAccordionSectionId =
  | "additionalInformation"
  | "faq"
  | "references"
  | "productDetails";

export type ProductAccordionSection = {
  id: ProductAccordionSectionId;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  faqItems?: ReadonlyArray<{ question: string; answer: string }>;
};

const ACCORDION_ORDER: readonly ProductAccordionSectionId[] = [
  "additionalInformation",
  "faq",
  "references",
  "productDetails",
];

function buildMedicineProductDetailsBullets(product: MedicineProduct): string[] {
  const { medicineDetails, tax, brand, sku } = product;
  const lines: string[] = [];

  if (brand) {
    lines.push(`Brand: ${brand}`);
  }
  lines.push(`Manufacturer: ${medicineDetails.manufacturer}`);
  lines.push(`SKU: ${sku}`);
  lines.push(`Pack size: ${medicineDetails.packSize}`);
  lines.push(`Salt composition: ${medicineDetails.saltComposition}`);
  lines.push(`Dosage form: ${medicineDetails.dosageForm}`);
  lines.push(`Therapeutic class: ${medicineDetails.therapy}`);
  lines.push(`HSN code: ${tax.hsnCode}`);

  if (medicineDetails.batches[0]?.expiryDate) {
    lines.push(`Expiry: ${medicineDetails.batches[0].expiryDate}`);
  }

  return lines;
}

function buildHealthcareProductDetailsBullets(product: HealthcareProduct): string[] {
  const variant = getDefaultVariant(product);
  const details = product.productDetails;
  const lines: string[] = [];

  if (product.brand) {
    lines.push(`Brand: ${product.brand}`);
  }
  if (variant?.sku) {
    lines.push(`SKU: ${variant.sku}`);
  }
  if (details?.countryOfOrigin) {
    lines.push(`Country of origin: ${details.countryOfOrigin}`);
  }
  if (details?.expiryInfo) {
    lines.push(`Expiry: ${details.expiryInfo}`);
  }
  if (details?.manufacturerAddress) {
    lines.push(`Manufacturer address: ${details.manufacturerAddress}`);
  }

  return lines;
}

function getAdditionalInformationSection(product: Product): ProductAccordionSection | null {
  if (isMedicineProduct(product)) {
    const text = product.medicineDetails.additionalInformation?.trim();
    if (!text) {
      return null;
    }
    return {
      id: "additionalInformation",
      title: "Additional Information",
      paragraphs: [text],
    };
  }

  const text = product.description?.trim();
  if (!text) {
    return null;
  }

  return {
    id: "additionalInformation",
    title: "Additional Information",
    paragraphs: [text],
  };
}

function getFaqSection(product: Product): ProductAccordionSection | null {
  if (!isMedicineProduct(product)) {
    return null;
  }

  const items = product.medicineDetails.faq?.filter(
    (item) => item.question.trim() && item.answer.trim(),
  );

  if (!items?.length) {
    return null;
  }

  return {
    id: "faq",
    title: "FAQ",
    faqItems: items,
  };
}

function getReferencesSection(product: Product): ProductAccordionSection | null {
  if (!isMedicineProduct(product)) {
    return null;
  }

  const bullets = parseBulletList(product.medicineDetails.references);
  if (bullets.length === 0) {
    return null;
  }

  return {
    id: "references",
    title: "References",
    bullets,
  };
}

function getProductDetailsSection(product: Product): ProductAccordionSection | null {
  const bullets = isMedicineProduct(product)
    ? buildMedicineProductDetailsBullets(product)
    : isHealthcareProduct(product)
      ? buildHealthcareProductDetailsBullets(product)
      : [];

  if (bullets.length === 0) {
    return null;
  }

  return {
    id: "productDetails",
    title: "Product Details",
    bullets,
  };
}

const SECTION_BUILDERS: Record<
  ProductAccordionSectionId,
  (product: Product) => ProductAccordionSection | null
> = {
  additionalInformation: getAdditionalInformationSection,
  faq: getFaqSection,
  references: getReferencesSection,
  productDetails: getProductDetailsSection,
};

function buildProductAccordionSections(product: Product): ProductAccordionSection[] {
  return ACCORDION_ORDER.map((id) => SECTION_BUILDERS[id](product)).filter(
    (section): section is ProductAccordionSection => section != null,
  );
}

export function getProductAccordionSections(product: Product): ProductAccordionSection[] {
  return accordionSectionsCache.get(product.id, () => buildProductAccordionSections(product));
}
