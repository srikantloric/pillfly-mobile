import type { MedicineProduct, Product } from "@/types/product";
import { isMedicineProduct } from "@/utils/productDisplay";

export type MedicalInfoTabId =
  | "uses"
  | "contraindications"
  | "sideEffects"
  | "precautions";

export type MedicalInfoTab = {
  id: MedicalInfoTabId;
  label: string;
};

export type MedicalInfoSection = {
  id: MedicalInfoTabId;
  title: string;
  bullets: string[];
};

export const MEDICAL_INFO_TABS: readonly MedicalInfoTab[] = [
  { id: "uses", label: "Uses" },
  { id: "contraindications", label: "Contraindications" },
  { id: "sideEffects", label: "Side Effects" },
  { id: "precautions", label: "Precautions & Warnings" },
] as const;

/** Splits API copy into bullet lines (newline preferred, comma fallback). */
export function parseBulletList(content: string | undefined): string[] {
  if (!content?.trim()) {
    return [];
  }

  const trimmed = content.trim();
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }

  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getProductMedicalDescription(product: Product): string | undefined {
  const text = product.description?.trim();
  return text || undefined;
}

export function getProductMedicalSections(product: Product): MedicalInfoSection[] {
  if (!isMedicineProduct(product)) {
    return [];
  }

  const { medicineDetails } = product;

  const sections: Array<MedicalInfoSection | null> = [
    {
      id: "uses",
      title: "Uses",
      bullets: parseBulletList(medicineDetails.uses),
    },
    {
      id: "contraindications",
      title: "Contraindications",
      bullets: parseBulletList(medicineDetails.contraindications),
    },
    {
      id: "sideEffects",
      title: "Side effects",
      bullets: parseBulletList(medicineDetails.sideEffects),
    },
    {
      id: "precautions",
      title: "Precautions & Warnings",
      bullets: parseBulletList(medicineDetails.warnings),
    },
  ];

  return sections.filter(
    (section): section is MedicalInfoSection =>
      section != null && section.bullets.length > 0,
  );
}

export function hasProductMedicalContent(product: Product): boolean {
  return (
    Boolean(getProductMedicalDescription(product)) ||
    getProductMedicalSections(product).length > 0
  );
}

export function isMedicineWithMedicalContent(
  product: Product,
): product is MedicineProduct {
  return isMedicineProduct(product) && hasProductMedicalContent(product);
}
