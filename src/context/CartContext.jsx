import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

const CartContext = createContext(null);

// cartItems shape:
//   { [id]: { quantity, name, image, price, mrp, code, _isFreeOffer?, _offerId? } }
// Free offer items have _isFreeOffer: true, price: 0, and _offerId linking
// them to the SundayDiscount configuration that granted them.

const STORAGE_KEY = "synergein_cart_v1";

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cartItems: {} };
    return { cartItems: JSON.parse(raw) };
  } catch {
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
      if (!existing) return state;
      // Don't let users change qty of free offer items
      if (existing._isFreeOffer) return state;
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
      const existing = state.cartItems[action.payload.productId];
      // Don't let users manually remove free offer items
      if (existing?._isFreeOffer) return state;
      const { [action.payload.productId]: _removed, ...rest } = state.cartItems;
      return { ...state, cartItems: rest };
    }

    case "CLEAR_CART":
      return { ...state, cartItems: {} };

    case "RESTORE_CART": {
      return { ...state, cartItems: action.payload || {} };
    }

    // Batch-add free offer items for a qualifying offer
    case "ADD_FREE_OFFER_ITEMS": {
      const { offerId, items } = action.payload;
      const newItems = { ...state.cartItems };
      items.forEach((item) => {
        const key = `free_${offerId}_${item.id}`;
        if (!newItems[key]) {
          newItems[key] = {
            quantity: 1,
            name: item.name,
            image: item.image,
            price: 0,
            mrp: item.mrp || 0,
            code: "",
            _isFreeOffer: true,
            _offerId: offerId,
          };
        }
      });
      return { ...state, cartItems: newItems };
    }

    // Remove all free items belonging to a specific offer
    case "REMOVE_FREE_OFFER_ITEMS": {
      const oid = action.payload.offerId;
      const filtered = {};
      for (const [key, val] of Object.entries(state.cartItems)) {
        if (!(val._isFreeOffer && val._offerId === oid)) {
          filtered[key] = val;
        }
      }
      return { ...state, cartItems: filtered };
    }

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

  // Offer configurations from the Sunday offer API
  const [offerConfigs, setOfferConfigs] = useState([]);
  // Track which offers are currently applied so we don't re-dispatch
  const appliedOffersRef = useRef(new Set());

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cartItems));
    } catch {
      /* ignore */
    }
  }, [state.cartItems]);

  // Compute cart subtotal from PAID items only (exclude free offer items)
  const paidSubtotal = Object.values(state.cartItems).reduce((sum, entry) => {
    if (entry._isFreeOffer) return sum;
    return sum + parseFloat(entry.price || 0) * entry.quantity;
  }, 0);

  // Auto-add/remove free items — only the HIGHEST qualifying offer applies.
  // Display only — these items won't be sent to the order API.
  useEffect(() => {
    if (offerConfigs.length === 0) return;

    // Sort configs by condition_value descending so we pick the highest first
    const sorted = [...offerConfigs].sort(
      (a, b) =>
        parseFloat(b.condition_value || 0) - parseFloat(a.condition_value || 0),
    );

    // Find the highest offer the subtotal qualifies for
    const bestOffer = sorted.find(
      (c) =>
        paidSubtotal >= parseFloat(c.condition_value || 0) &&
        c.offeritems &&
        c.offeritems.length > 0,
    );

    const currentApplied = appliedOffersRef.current;
    const bestId = bestOffer?.offer_id || null;

    // Remove any previously applied offers that aren't the best one
    for (const appliedId of [...currentApplied]) {
      if (appliedId !== bestId) {
        dispatch({
          type: "REMOVE_FREE_OFFER_ITEMS",
          payload: { offerId: appliedId },
        });
        currentApplied.delete(appliedId);
      }
    }

    // Add the best offer if not already applied
    if (bestId && !currentApplied.has(bestId)) {
      dispatch({
        type: "ADD_FREE_OFFER_ITEMS",
        payload: { offerId: bestId, items: bestOffer.offeritems },
      });
      currentApplied.add(bestId);
    }

    // If subtotal dropped below all thresholds, remove everything
    if (!bestOffer) {
      for (const appliedId of [...currentApplied]) {
        dispatch({
          type: "REMOVE_FREE_OFFER_ITEMS",
          payload: { offerId: appliedId },
        });
        currentApplied.delete(appliedId);
      }
    }
  }, [paidSubtotal, offerConfigs]);

  const cartCount = Object.values(state.cartItems).reduce(
    (sum, entry) => sum + entry.quantity,
    0,
  );

  const value = {
    cartItems: state.cartItems,
    cartCount,
    paidSubtotal,
    addToCart: (product, quantity = 1) =>
      dispatch({ type: "ADD_TO_CART", payload: { product, quantity } }),
    setQuantity: (productId, quantity) =>
      dispatch({ type: "SET_QUANTITY", payload: { productId, quantity } }),
    removeFromCart: (productId) =>
      dispatch({ type: "REMOVE_FROM_CART", payload: { productId } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    backupAndClearCart: () => {
      try {
        localStorage.setItem(
          "synergein_cart_backup",
          JSON.stringify(state.cartItems),
        );
      } catch {
        /* ignore */
      }
      dispatch({ type: "CLEAR_CART" });
    },
    restoreCart: () => {
      try {
        const raw = localStorage.getItem("synergein_cart_backup");
        if (raw) {
          dispatch({ type: "RESTORE_CART", payload: JSON.parse(raw) });
          localStorage.removeItem("synergein_cart_backup");
        }
      } catch {
        /* ignore */
      }
    },
    // Called from Home page after fetching offer configs
    setOfferConfigs,
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
