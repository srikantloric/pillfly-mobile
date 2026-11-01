import { create } from "zustand";

import { useCartStore } from "@/features/cart/store/cart.store";
import { RequestError } from "@/services/api/requestError";

import { listCustomerAddresses } from "../api/address.api";
import { isCustomerAddress, type CustomerAddress } from "../types/address.types";
import { resolveSelectedAddress } from "../utils/addressSelection";

type AddressListStatus = "idle" | "loading" | "ready" | "error";

type AddressListState = {
  status: AddressListStatus;
  addresses: CustomerAddress[];
  error: string | null;
  load: () => Promise<void>;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
  upsert: (address: CustomerAddress) => void;
  remove: (addressId: string) => void;
};

function errorMessage(error: unknown): string {
  if (error instanceof RequestError) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function syncSelection(addresses: readonly CustomerAddress[]): void {
  const selected = useCartStore.getState().deliveryAddress;
  const current = isCustomerAddress(selected) ? selected : null;
  const next = resolveSelectedAddress(current, addresses);
  if (next?.id !== current?.id || next?.updatedAt !== current?.updatedAt) {
    useCartStore.getState().setDeliveryAddress(next);
  }
}

async function fetchAddresses(
  set: (partial: Partial<AddressListState>) => void,
  get: () => AddressListState,
): Promise<void> {
  const previous = get().status;
  set({ status: "loading", error: null });

  try {
    const addresses = await listCustomerAddresses();
    set({ status: "ready", addresses, error: null });
    syncSelection(addresses);
  } catch (error) {
    if (previous === "ready") {
      set({ status: "ready", error: errorMessage(error) });
      return;
    }

    set({ status: "error", error: errorMessage(error) });
  }
}

export const useAddressListStore = create<AddressListState>((set, get) => ({
  status: "idle",
  addresses: [],
  error: null,

  load: async () => {
    const { status } = get();
    if (status === "loading" || status === "ready") {
      return;
    }

    await fetchAddresses(set, get);
  },

  retry: async () => {
    await fetchAddresses(set, get);
  },

  refresh: async () => {
    await fetchAddresses(set, get);
  },

  upsert: (address) => {
    set((state) => {
      const exists = state.addresses.some((item) => item.id === address.id);
      return {
        status: "ready",
        error: null,
        addresses: exists
          ? state.addresses.map((item) => (item.id === address.id ? address : item))
          : [address, ...state.addresses],
      };
    });
  },

  remove: (addressId) => {
    set((state) => ({
      addresses: state.addresses.filter((item) => item.id !== addressId),
    }));
  },
}));
