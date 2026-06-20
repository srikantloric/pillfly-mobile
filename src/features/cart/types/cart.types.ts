export type CartLineItem = {
  productId: string;
  quantity: number;
};

export type DeliveryAddress = {
  id: string;
  label: string;
  line1: string;
  city: string;
  pincode: string;
};

export type CartBillLine = {
  id: string;
  label: string;
  amount: number;
  strikethroughAmount?: number;
  tone?: "default" | "discount" | "total";
  indent?: boolean;
};

export type CartBill = {
  mrpTotal: number;
  discountTotal: number;
  discountedValue: number;
  deliveryFee: number;
  deliveryFeeMrp: number;
  platformFee: number;
  amountToPay: number;
  savingsTotal: number;
  lines: CartBillLine[];
};

export type ResolvedCartLine = {
  productId: string;
  quantity: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mrp: number;
  salePrice: number;
  lineTotal: number;
};
