import type { Product } from "@/types/product";

export const mockProducts: Product[] = [
  {
    id: "1",
    productType: "MEDICINE",

    title: "Paracetamol 500mg",
    slug: "paracetamol-500mg",

    description: "Pain relief medicine",
    brand: "Cipla",

    status: "ACTIVE",

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    tax: {
      hsnCode: "30049099",
      sGstRate: 2.5,
      cGstRate: 2.5,
    },

    categories: ["health-concerns"],

    mrp: 120,
    discount: 10,

    stock: 50,

    sku: "MED-001",

    isPrescriptionRequired: false,

    images: [
      {
        url: "https://picsum.photos/300",
        type: "PRIMARY",
      },
    ],

    medicineDetails: {
      manufacturer: "Cipla",

      dosageForm: "TABLET",

      unit: "STRIP",

      packSize: "10 Tablets",

      batches: [
        {
          batchNumber: "B001",
          expiryDate: "2027-12-31",
          stock: 50,
        },
      ],

      saltComposition: "Paracetamol",

      uses: "Fever and pain relief",

      therapy: "Analgesic",

      sideEffects: "Nausea",
    },
  },
];
