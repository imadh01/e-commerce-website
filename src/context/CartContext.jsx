import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

// cartItems shape changed:
//   OLD: { [id]: quantity }
//   NEW: { [id]: { quantity, name, image, price, mrp, code } }
// The snapshot fields are what we saw at add-time. Real e-commerce
// stores the price you paid, not today's price — same principle.

const STORAGE_KEY = "synergein_cart_v1";

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cartItems: {} };
    return { cartItems: JSON.parse(raw) };
  } catch {
    // Corrupt localStorage / private mode — start fresh, don't crash.
    return { cartItems: {} };
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity = 1 } = action.payload;
      const existing = state.cartItems[product.id];
      const currentQty = existing?.quantity || 0;
      return {
        ...state,
        cartItems: {
          ...state.cartItems,
          [product.id]: {
            quantity: currentQty + quantity,
            name: product.name,
            image: product.image,
            price: product.price,
            mrp: product.mrp,
            code: product.code,
          },
        },
      };
    }

    case "SET_QUANTITY": {
      const { productId, quantity } = action.payload;
      const existing = state.cartItems[productId];
      if (!existing) return state; // nothing to update
      if (quantity <= 0) {
        const { [productId]: _removed, ...rest } = state.cartItems;
        return { ...state, cartItems: rest };
      }
      return {
        ...state,
        cartItems: {
          ...state.cartItems,
          [productId]: { ...existing, quantity },
        },
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
  const [state, dispatch] = useReducer(
    cartReducer,
    undefined,
    loadInitialState,
  );

  // Persist to localStorage on every change. useEffect runs after render,
  // so we're not blocking the UI. If storage is unavailable (Safari
  // private mode has quirks), fail silently — the app still works.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cartItems));
    } catch {
      /* ignore */
    }
  }, [state.cartItems]);

  const cartCount = Object.values(state.cartItems).reduce(
    (sum, entry) => sum + entry.quantity,
    0,
  );

  const value = {
    cartItems: state.cartItems,
    cartCount,
    // Note: addToCart now takes the whole product object, not just an id.
    addToCart: (product, quantity = 1) =>
      dispatch({ type: "ADD_TO_CART", payload: { product, quantity } }),
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
