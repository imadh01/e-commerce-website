import api from "./axiosClient";

export async function fetchCatalog() {
  const response = await api.get("/catalog");
  return response.data.data;
}

export async function fetchSundayOffers() {
  const response = await api.get("/sundayoffer");

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to fetch sunday offers");
  }

  return response.data.data;
}

export async function fetchSundayOfferConfig(userId) {
  const response = await api.get("/sundayofferconfiguration", {
    params: { UserID: userId },
  });

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to fetch offer config");
  }

  return response.data.data;
}
