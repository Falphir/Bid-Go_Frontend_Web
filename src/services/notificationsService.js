/**
 * Notifications service.
 *
 * Provides functions to fetch notifications for a user and mark them
 * as read individually or in bulk.
 */

import api from "../api/axiosConfig";

/**
 * Fetches notifications for a given user.
 *
 * @async
 * @param {string|number} userId - Identifier of the user to fetch notifications for.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object[]>} List of notifications or an empty array.
 */
export async function fetchNotifications(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/notifications?userId=${userId}`, { signal });
  return res.data || [];
}

/**
 * Marks a single notification as read.
 *
 * @async
 * @param {string|number} notificationId - Identifier of the notification to mark as read.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} Updated notification resource.
 */
export async function markAsRead(notificationId, signal) {
  const res = await api.patch(
    `/notifications/mark-read/${notificationId}`,
    null,
    { signal }
  );
  return res.data;
}

/**
 * Marks all notifications for the current user as read.
 *
 * @async
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} Backend response after marking all as read.
 */
export async function markAllAsRead(signal) {
  const res = await api.patch(`/notifications/mark-all-read`, null, { signal });
  return res.data;
}

/**
 * Aggregated notifications service exposing all notification operations.
 *
 * @type {Object}
 */
const notificationsService = { fetchNotifications, markAsRead, markAllAsRead };
export default notificationsService;
