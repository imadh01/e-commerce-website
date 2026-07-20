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
