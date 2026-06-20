import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartLineItem, DeliveryAddress } from "../types/cart.types";

type CartState = {
  items: CartLineItem[];
  deliveryAddress: DeliveryAddress | null;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      deliveryAddress: null,

      addItem: (productId) => {
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { productId, quantity: 1 }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
          }));
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
    }),
    {
      name: "pillfly-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        deliveryAddress: state.deliveryAddress,
      }),
    },
  ),
);
