import api from "../api/axiosClient";

// Transform frontend cart + form data into the shape the backend expects

function buildOrderPayload(data) {
  const dateTime =
    data.deliveryDate && data.deliveryTime
      ? `${data.deliveryDate} ${data.deliveryTime.replace("-", " ")}`
      : null;

  return {
    Address: {
      AddressID: data.addressId || null,
      AddressType: data.addressType || "Home",
      AddressLine1: data.addressLine1,
      AddressLine2: data.addressLine2 || "",
      Landmark: data.landmark || "",
      Locality: data.locality || "",
      Taluk: data.taluk || "",
      District: data.district || "",
      State: data.state || "",
      Country: data.country || "India",
      PostalCode: data.postalCode || "",
      GeoLocation: data.geoLocation || null,
    },
    Product: data.items.map((item) => ({
      product: {
        id: item.productId,
        price: parseFloat(item.price),
        discount: parseFloat(item.discount || 0),
        mrp: parseFloat(item.mrp || item.price),
      },
      qty: item.quantity,
    })),
    PaymentMode: data.paymentMode,
    DateTime: dateTime,
    DeliveryInstruction: data.deliveryInstruction || "",
    Voucher: data.voucherDiscount || 0,
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
