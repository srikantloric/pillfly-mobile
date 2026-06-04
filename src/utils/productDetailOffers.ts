import { PRODUCT_DETAIL_OFFER_COUPON_IDS } from "@/mocks/productDetail.mock";
import { SAVINGS_COUPONS, type SavingsCoupon } from "@/mocks/savings.mock";

let cachedOffers: SavingsCoupon[] | null = null;

export function getProductDetailOffers(): SavingsCoupon[] {
  if (cachedOffers) {
    return cachedOffers;
  }

  const idSet = new Set(PRODUCT_DETAIL_OFFER_COUPON_IDS);
  cachedOffers = SAVINGS_COUPONS.filter((coupon) => idSet.has(coupon.id));
  return cachedOffers;
}
