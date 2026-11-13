import { useCartStore } from "../store/cart.store";

describe("cart variant lines", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], deliveryAddress: null });
  });

  it("keeps a stored line without variantId separate from variant lines", () => {
    useCartStore.setState({
      items: [{ productId: "prod_1", quantity: 2 }],
      deliveryAddress: null,
    });

    useCartStore.getState().addItem("prod_1");
    useCartStore.getState().addItem("prod_1", "var_a");
    useCartStore.getState().addItem("prod_1", "var_b");
    useCartStore.getState().addItem("prod_1", "var_a");

    expect(useCartStore.getState().items).toEqual([
      { productId: "prod_1", quantity: 3 },
      { productId: "prod_1", variantId: "var_a", quantity: 2 },
      { productId: "prod_1", variantId: "var_b", quantity: 1 },
    ]);

    useCartStore.getState().removeItem("prod_1", "var_a");

    expect(useCartStore.getState().items).toEqual([
      { productId: "prod_1", quantity: 3 },
      { productId: "prod_1", variantId: "var_b", quantity: 1 },
    ]);
  });
});
