export const ORDER_PATHS = {
  collection: "/customer/orders",
  byId: (orderId: string) => `/customer/orders/${encodeURIComponent(orderId)}`,
  verifyPayment: (orderId: string) =>
    `/customer/orders/${encodeURIComponent(orderId)}/payment/verify`,
  cancel: (orderId: string) => `/customer/orders/${encodeURIComponent(orderId)}/cancel`,
  refund: (orderId: string) => `/customer/orders/${encodeURIComponent(orderId)}/refund`,
} as const;
