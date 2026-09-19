import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("healhub_token") || localStorage.getItem("ambula_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("healhub_token");
      localStorage.removeItem("healhub_user");
      localStorage.removeItem("ambula_token");
      localStorage.removeItem("ambula_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
