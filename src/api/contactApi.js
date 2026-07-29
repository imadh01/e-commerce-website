import api from "./axiosClient";

export async function submitContactForm(data) {
  const response = await api.post("/contactus", data);
  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to submit");
  }
  return response.data;
}
