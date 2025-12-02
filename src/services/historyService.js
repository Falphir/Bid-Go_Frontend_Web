import api from "../api/axiosConfig";
import {
  normalizeHistoryDriver,
  normalizeHistoryCompany,
} from "../utils/normalizers";

// Service de histórico: driver e empresa

export async function getDriverHistory(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/history/driver/${userId}`, { signal });
  return normalizeHistoryDriver(res.data);
}

export async function getCompanyHistory(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/history/company/${userId}`, { signal });
  return normalizeHistoryCompany(res.data);
}

const historyService = { getDriverHistory, getCompanyHistory };
export default historyService;
