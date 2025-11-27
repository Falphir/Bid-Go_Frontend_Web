import api from "../api/axiosConfig";

export async function fetchNotifications(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/notifications?userId=${userId}`, { signal });
  return res.data || [];
}

export async function markAsRead(notificationId, signal) {
  const res = await api.patch(`/notifications/mark-read/${notificationId}`, null, { signal });
  return res.data;
}

export async function markAllAsRead(signal) {
  const res = await api.patch(`/notifications/mark-all-read`, null, { signal });
  return res.data;
}

const notificationsService = { fetchNotifications, markAsRead, markAllAsRead };
export default notificationsService;
