import api from "./axiosClient";

// Check if customer exists in Laravel DB (called after OTP verified)
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
    // 404 = customer not found, that's expected for new users
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

// Called at checkout — creates customer if new, updates if existing
export async function upsertCustomer(data) {
  const response = await api.post("/userdetails", data);

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to save customer details");
  }

  return response.data.data;
}
