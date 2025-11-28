import axios from "axios";

const api = axios.create({
  baseURL:
    "https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";

      if (error.response?.status === 401 && !requestUrl.includes("/auth/login")) {
          if (typeof window !== "undefined" && window.__PLAYWRIGHT_TEST__) {
          return Promise.reject(error);
        }

        console.warn("⚠️ Sessão expirada. Faz login novamente.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
