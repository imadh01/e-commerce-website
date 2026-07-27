import api from "../../api/axiosClient";

// Fetches categories and product items together from the /catalog
// endpoint. Both come back in one response, per the backend team.
//
// Returns { categories, items } — raw shape from the API, unprocessed.
// Any cleanup/filtering (hiding $0 items, formatting prices) happens
// separately, in the component, so this function stays a simple,
// reusable "get the data" call.
export async function fetchCatalog() {
  const response = await api.get("/catalog");
  return response.data.data; // unwrap { status, message, data: {...} }
}

// Fetches Sunday offer banners + discounted products.
// This route lives outside Laravel's /api group, so we hit the
// backend origin directly instead of going through axiosClient's
// /api baseURL.
export async function fetchSundayOffers() {
  const response = await api.get("/sundayoffer");

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to fetch sunday offers");
  }

  return response.data.data;
}

// Fetches Sunday offer configurations (free items per offer).
// Requires logged-in user with a default address.
export async function fetchSundayOfferConfig(userId) {
  const response = await api.get("/sundayofferconfiguration", {
    params: { UserID: userId },
  });

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to fetch offer config");
  }

  return response.data.data;
}
