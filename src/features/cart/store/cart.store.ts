import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { subscribeAuthTokens } from "@/features/auth/api/authSession";
import { isCustomerAddress } from "@/features/address/types/address.types";

import type { CartLineItem, DeliveryAddress } from "../types/cart.types";

function isSameCartLine(
  item: CartLineItem,
  productId: string,
  variantId?: string,
): boolean {
  return item.productId === productId && item.variantId === variantId;
}

type CartState = {
  items: CartLineItem[];
  deliveryAddress: DeliveryAddress | null;
  addItem: (productId: string, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      deliveryAddress: null,

      addItem: (productId, variantId) => {
        set((state) => {
          const existing = state.items.find((item) => isSameCartLine(item, productId, variantId));

          if (existing) {
            return {
              items: state.items.map((item) =>
                isSameCartLine(item, productId, variantId)
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { productId, variantId, quantity: 1 }],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter((item) => !isSameCartLine(item, productId, variantId)),
        }));
      },

      setQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => !isSameCartLine(item, productId, variantId)),
          }));
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            isSameCartLine(item, productId, variantId) ? { ...item, quantity } : item,
          ),
        }));
      },

      clearCart: () => set({ items: [], deliveryAddress: null }),

      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
    }),
    {
      name: "pillfly-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        deliveryAddress: state.deliveryAddress,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.deliveryAddress && !isCustomerAddress(state.deliveryAddress)) {
          useCartStore.setState({ deliveryAddress: null });
        }
      },
    },
  ),
);

function wipePersistedCart() {
  useCartStore.setState({ items: [], deliveryAddress: null });
}

export function resetSessionCart() {
  wipePersistedCart();

  if (useCartStore.persist.hasHydrated()) {
    return;
  }

  const unsubscribe = useCartStore.persist.onFinishHydration(() => {
    wipePersistedCart();
    unsubscribe();
  });
}

subscribeAuthTokens((tokens) => {
  if (!tokens) {
    resetSessionCart();
  }
});
