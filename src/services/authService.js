import api from "../api/axiosConfig";

// Service de autenticação: login/registo/recover/reset

export async function login(email, password, signal) {
  const res = await api.post("/auth/login", { email, password }, { signal });
  return res.data;
}

const authService = { login };
export default authService;

export async function registerDriver(formData, signal) {
  const res = await api.post(`/register/driver`, formData, { signal });
  return res.data;
}

export async function registerCompany(payload, signal) {
  const res = await api.post(`/register/company`, payload, { signal });
  return res.data;
}

export async function recoverPassword(email, signal) {
  const res = await api.post(`/auth/recover-password`, { email }, { signal });
  return res.data;
}

export async function resetPassword(token, newPassword, signal) {
  const res = await api.post(
    `/auth/reset-password`,
    { token, newPassword },
    { signal }
  );
  return res.data;
}
