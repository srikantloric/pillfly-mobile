import { PRODUCT_DETAIL_OFFER_COUPON_IDS } from "@/features/product/mocks/detail.mock";
import { SAVINGS_COUPONS, type SavingsCoupon } from "@/features/savings";

export function getProductDetailOffers(): SavingsCoupon[] {
  return SAVINGS_COUPONS.filter((coupon) => PRODUCT_DETAIL_OFFER_COUPON_IDS.includes(coupon.id));
}
