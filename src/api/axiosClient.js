// Central Axios instance for all API calls.
//
// Every component should import `api` from here instead of calling axios
// directly — that way, base URL, headers, and error handling only need
// to be configured in one place.
//
// VITE_API_BASE_URL should point at the Laravel backend once it exists,
// e.g. VITE_API_BASE_URL=https://api.synergein.com/api
// Set it in a local .env file (see .env.example).

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  // withCredentials is needed if the Laravel backend uses Sanctum's
  // cookie-based session auth for guest carts / logged-in users.
  // Leave this on once that decision is confirmed with the backend dev.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Central place to react to failed requests (expired session, server
// down, etc.) without repeating try/catch boilerplate in every component.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API error ${error.response.status}:`,
        error.response.data?.message || error.message
      );
    } else if (error.request) {
      console.error('API error: no response received', error.message);
    } else {
      console.error('API error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;