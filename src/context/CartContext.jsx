// Cart state, shared across the app (Header badge, Home product grid,
// quick-view modal all read/write this same state).
//
// This is intentionally plain React Context + useReducer — no Redux.
// At this project's size, Context is simpler and has no extra dependency.
//
// Note: wishlist was considered but dropped for now — there's no page
// to view saved items yet, so a toggle with nowhere to see the result
// isn't a real feature. Add it back properly (with a Wishlist page)
// if/when it's actually needed.

import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

const initialState = {
  // cartItems: { [productId]: quantity }
  cartItems: {},
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { productId, quantity = 1 } = action.payload;
      const currentQty = state.cartItems[productId] || 0;
      return {
        ...state,
        cartItems: {
          ...state.cartItems,
          [productId]: currentQty + quantity,
        },
      };
    }

    case "SET_QUANTITY": {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        const { [productId]: _removed, ...rest } = state.cartItems;
        return { ...state, cartItems: rest };
      }
      return {
        ...state,
        cartItems: { ...state.cartItems, [productId]: quantity },
      };
    }

    case "REMOVE_FROM_CART": {
      const { [action.payload.productId]: _removed, ...rest } = state.cartItems;
      return { ...state, cartItems: rest };
    }

    case "CLEAR_CART":
      return { ...state, cartItems: {} };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const cartCount = Object.values(state.cartItems).reduce(
    (sum, qty) => sum + qty,
    0,
  );

  const value = {
    cartItems: state.cartItems,
    cartCount,
    addToCart: (productId, quantity = 1) =>
      dispatch({ type: "ADD_TO_CART", payload: { productId, quantity } }),
    setQuantity: (productId, quantity) =>
      dispatch({ type: "SET_QUANTITY", payload: { productId, quantity } }),
    removeFromCart: (productId) =>
      dispatch({ type: "REMOVE_FROM_CART", payload: { productId } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
