import axios from "axios";

// Axios base instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 (except login) -> clear token + redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";

    if (error.response?.status === 401 && !requestUrl.includes("/auth/login")) {
      if (typeof window !== "undefined" && window.__PLAYWRIGHT_TEST__) {
        return Promise.reject(error);
      }

      console.warn("Sessão expirada. Faz login novamente.");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
