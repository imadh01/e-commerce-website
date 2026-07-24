import api from "./axiosClient";

let cachedLocations = null;

export async function fetchLocationMaster() {
  // Cache it — location data doesn't change during a session
  if (cachedLocations) return cachedLocations;

  const response = await api.get("/locationmaster");

  if (!response.data.status) {
    throw new Error("Failed to fetch location data");
  }

  cachedLocations = response.data.data;
  return cachedLocations;
}
