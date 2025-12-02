import api from "../api/axiosConfig";

// Service de perfil: obter/atualizar dados e credenciais

export async function getProfile(userId, signal) {
  if (!userId) return null;
  const res = await api.get(`/profile/${userId}`, { signal });
  return res.data;
}

export async function updateDriver(userId, formData, signal) {
  const res = await api.put(`profile/updateDriver/${userId}`, formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateCompany(userId, formData, signal) {
  const res = await api.put(`profile/updateCompany/${userId}`, formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deactivateAccount(userId, signal) {
  const res = await api.put(`/profile/${userId}/deactivateAccount`, null, {
    signal,
  });
  return res.data;
}

export async function changePassword(
  userId,
  currentPassword,
  newPassword,
  signal
) {
  const res = await api.put(
    `/profile/${userId}/changePassword`,
    { currentPassword, newPassword },
    { signal }
  );
  return res.data;
}

const profileService = {
  getProfile,
  updateDriver,
  updateCompany,
  deactivateAccount,
  changePassword,
};
export default profileService;
