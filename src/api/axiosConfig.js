import axios from "axios";

// Cria uma instância global do Axios
const api = axios.create({
    baseURL: "https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Interceptor para inserir automaticamente o token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🚨 Interceptor opcional para lidar com 401 (token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("⚠️ Sessão expirada. Faz login novamente.");
            localStorage.removeItem("token");
            window.location.href = "/login"; // redireciona para o login
        }
        return Promise.reject(error);
    }
);

export default api;