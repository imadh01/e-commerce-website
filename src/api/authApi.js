import api from "./axiosClient";

// Check if customer exists in Laravel DB
export async function fetchCustomerByPhone(mobile) {
  try {
    const response = await api.get("/userdetails", {
      params: { PrimaryMobile: mobile },
    });

    if (!response.data.status) {
      return null;
    }

    return response.data.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

// Creates or updates customer details
export async function upsertCustomer(data) {
  const response = await api.post("/userdetails", data);

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to save customer details");
  }

  return response.data.data;
}

// Creates or updates a customer address
export async function upsertCustomerAddress(data) {
  const response = await api.post("/customeraddress", data);

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to save address");
  }

  return response.data.data;
}
