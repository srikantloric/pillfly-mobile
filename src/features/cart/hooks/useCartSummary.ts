import { useMemo } from "react";

import { useCartStore } from "../store/cart.store";
import { buildCartBill, getCartItemCount } from "../utils/cartPricing";

export function useCartSummary() {
  const items = useCartStore((state) => state.items);

  return useMemo(() => {
    const itemCount = getCartItemCount(items);
    const bill = buildCartBill(items);

    return {
      itemCount,
      bill,
      totalLabel: bill ? bill.amountToPay : 0,
      stickyLabel: itemCount > 0 ? "In cart" : "Cart empty",
    };
  }, [items]);
}
