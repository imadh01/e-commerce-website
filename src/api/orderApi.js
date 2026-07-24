import api from "./axiosClient";

export async function fetchCustomerOrders(userId) {
  const response = await api.get("/customerorders", {
    params: { UserID: userId },
  });

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to fetch orders");
  }

  return response.data.data;
}

export async function fetchDeliveryTracking(salesOrderId) {
  const response = await api.get("/deliverytracking", {
    params: { SalesOrderID: salesOrderId },
  });

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to fetch tracking");
  }

  return response.data.data;
}
