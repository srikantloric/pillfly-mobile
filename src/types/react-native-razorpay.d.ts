declare module "react-native-razorpay" {
  type RazorpayCheckoutOptions = {
    key: string;
    amount: number | string;
    currency?: string;
    name?: string;
    description?: string;
    order_id?: string;
    prefill?: {
      name?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
  };

  type RazorpayCheckoutSuccess = {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };

  const RazorpayCheckout: {
    open(options: RazorpayCheckoutOptions): Promise<RazorpayCheckoutSuccess>;
  };

  export default RazorpayCheckout;
}
