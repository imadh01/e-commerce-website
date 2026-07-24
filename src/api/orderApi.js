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
