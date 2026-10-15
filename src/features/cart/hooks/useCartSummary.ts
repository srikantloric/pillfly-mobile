import { useCallback, useEffect, useMemo, useState } from "react";

import { productService } from "@/features/product/services/product.service";

import { useCartStore } from "../store/cart.store";
import {
  buildCartBill,
  getCartItemCount,
  getCartLineCount,
  resolveCartLines,
} from "../utils/cartPricing";

function cartItemKey(items: { productId: string; quantity: number }[]): string {
  return items.map((item) => `${item.productId}:${item.quantity}`).join("|");
}

export function useCartSummary() {
  const items = useCartStore((state) => state.items);
  const [persistHydrated, setPersistHydrated] = useState(() => useCartStore.persist.hasHydrated());
  const [catalogTick, setCatalogTick] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const retryResolve = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setPersistHydrated(true);
    }

    return useCartStore.persist.onFinishHydration(() => {
      setPersistHydrated(true);
    });
  }, []);

  const itemKey = cartItemKey(items);

  useEffect(() => {
    if (!persistHydrated) {
      return;
    }

    const missingIds = items
      .map((item) => item.productId)
      .filter((productId) => !productService.getProductById(productId));

    if (missingIds.length === 0) {
      setIsResolving(false);
      return;
    }

    let cancelled = false;
    setIsResolving(true);

    void productService.ensureProductsByIds(missingIds).finally(() => {
      if (!cancelled) {
        setIsResolving(false);
        setCatalogTick((current) => current + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [itemKey, items, persistHydrated, reloadToken]);

  return useMemo(() => {
    const itemCount = getCartItemCount(items);
    const lineCount = getCartLineCount(items);
    const resolvedLines = resolveCartLines(items);
    const bill = buildCartBill(items);
    const hasPersistedItems = items.length > 0;

    return {
      itemCount,
      lineCount,
      resolvedLines,
      bill,
      totalLabel: bill ? bill.amountToPay : 0,
      stickyLabel: itemCount > 0 ? "In cart" : "Cart empty",
      persistHydrated,
      isResolving,
      hasPersistedItems,
      retryResolve,
    };
  }, [catalogTick, isResolving, items, persistHydrated, retryResolve]);
}
