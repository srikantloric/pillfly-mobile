export const ADDRESS_PATHS = {
  collection: "/customer/addresses",
  byId: (addressId: string) => `/customer/addresses/${encodeURIComponent(addressId)}`,
} as const;
