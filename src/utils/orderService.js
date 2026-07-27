import api from "../api/axiosClient";

// Transform frontend cart + form data into the shape the backend expects

function buildOrderPayload(data) {
  return {
    Address: {
      AddressID: data.Address?.AddressID || null,
      AddressType: data.Address?.AddressType || "Home",
      AddressLine1: data.Address?.AddressLine1 || "",
      AddressLine2: data.Address?.AddressLine2 || "",
      Landmark: data.Address?.Landmark || "",
      Locality: data.Address?.Locality || "",
      Taluk: data.Address?.Taluk || "",
      District: data.Address?.District || "",
      State: data.Address?.State || "",
      Country: data.Address?.Country || "India",
      PostalCode: data.Address?.PostalCode || "",
      GeoLocation: data.Address?.GeoLocation || null,
    },

    Product: data.Product,

    PaymentMode: data.PaymentMode,

    DateTime: data.DateTime,

    DeliveryInstruction: data.DeliveryInstruction || "",

    Voucher: data.Voucher || 0,
  };
}

export async function placeOrder(data) {
  const payload = buildOrderPayload(data);
  console.log("ORDER PAYLOAD:", JSON.stringify(payload, null, 2));

  // Backend dev needs to make this POST — won't work as GET with body
  const response = await api.post("/salesorder", payload);

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to place order");
  }

  return response.data.data;
}

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem("synergein_orders_v1") || "[]");
  } catch {
    return [];
  }
}
