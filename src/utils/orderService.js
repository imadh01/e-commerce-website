import api from "../api/axiosClient";

// Transform frontend cart + form data into the shape the backend expects
function buildOrderPayload(data) {
  // Combine date + time into "2026-07-22 10:00 11:00" format
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

  const response = await api.post("/createSalesOrder", payload);

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to place order");
  }

  return response.data.data;

  // ===== MOCK (use while backend is unavailable) =====
  // const payload = buildOrderPayload(data);
  // console.log("Order payload:", payload);
  // await new Promise((r) => setTimeout(r, 800));
  // return {
  //   SalesOrderID: Date.now(),
  //   OrderNumber: `O-${1000 + Math.floor(Math.random() * 9000)}`,
  //   GrandTotal: "405.00",
  // };
}

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem("synergein_orders_v1") || "[]");
  } catch {
    return [];
  }
}
