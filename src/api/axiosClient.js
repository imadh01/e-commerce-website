import axios from "axios";

const api = axios.create({
  baseURL: "https://mamluktest.synergeinsolutions.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let csrfToken = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;

  const response = await api.get("/csrf-token");
  csrfToken = response.data.token;
  return csrfToken;
}

api.interceptors.request.use(async (config) => {
  const methodsNeedingCsrf = ["post", "put", "patch", "delete"];

  if (methodsNeedingCsrf.includes(config.method)) {
    const token = await getCsrfToken();
    config.headers["X-CSRF-TOKEN"] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 419) {
        csrfToken = null;
      }
      console.error(
        `API error ${error.response.status}:`,
        error.response.data?.message || error.message,
      );
    } else if (error.request) {
      console.error("API error: no response received", error.message);
    } else {
      console.error("API error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
