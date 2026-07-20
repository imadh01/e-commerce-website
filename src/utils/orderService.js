// This is the single place that talks to the backend for orders.
// Right now it mocks the response with localStorage.
// When the API is ready, replace the body of placeOrder() — nothing
// else in the app changes.

const ORDERS_KEY = "synergein_orders_v1";

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SYN-${timestamp}-${random}`;
}

export async function placeOrder(orderData) {
  // TODO: Replace with real API call when backend is ready:
  // const response = await api.post("/orders", orderData);
  // return response.data;

  // Mock: simulate network delay + save locally
  await new Promise((resolve) => setTimeout(resolve, 800));

  const order = {
    id: generateOrderId(),
    ...orderData,
    status: "confirmed",
    placedAt: new Date().toISOString(),
  };

  // Save to localStorage so My Orders page can read it later
  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    existing.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
  } catch {
    /* ignore */
  }

  return order;
}

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}
