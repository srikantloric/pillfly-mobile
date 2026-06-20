import { useMemo } from "react";

import { useCartStore } from "../store/cart.store";
import { buildCartBill, getCartItemCount, getCartLineCount } from "../utils/cartPricing";

export function useCartSummary() {
  const items = useCartStore((state) => state.items);

  return useMemo(() => {
    const itemCount = getCartItemCount(items);
    const lineCount = getCartLineCount(items);
    const bill = buildCartBill(items);

    return {
      itemCount,
      lineCount,
      bill,
      totalLabel: bill ? bill.amountToPay : 0,
      stickyLabel: itemCount > 0 ? "In cart" : "Cart empty",
    };
  }, [items]);
}
