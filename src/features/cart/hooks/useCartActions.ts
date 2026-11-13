import { useCallback } from "react";

import { useCartStore } from "../store/cart.store";

export function useCartActions() {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  const addToCart = useCallback(
    (productId: string, variantId?: string) => {
      addItem(productId, variantId);
    },
    [addItem],
  );

  const removeFromCart = useCallback(
    (productId: string, variantId?: string) => {
      removeItem(productId, variantId);
    },
    [removeItem],
  );

  return {
    addToCart,
    removeFromCart,
    setQuantity,
  };
}
