// src/api/axiosConfig.js
import axios from "axios";

// Cria uma instância global do Axios
const api = axios.create({
  baseURL:
    "https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api",
});

// ✅ Interceptor para inserir automaticamente o token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com sessão expirada (401),
// mas **IGNORAR** este comportamento no login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";

    //Se for 401 mas NAO for a rota de login → sessão expirada
      if (error.response?.status === 401 && !requestUrl.includes("/auth/login")) {
        // During end-to-end tests we prefer tests to control navigation and token state.
        // Tests can set `window.__PLAYWRIGHT_TEST__ = true` via Playwright's `addInitScript`.
        if (typeof window !== "undefined" && window.__PLAYWRIGHT_TEST__) {
          // Do not auto-redirect during tests; let tests handle token/redirect behavior.
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
