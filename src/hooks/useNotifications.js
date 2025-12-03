import { useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationsService";

/**
 * @typedef {Object} UseNotificationsResult
 * @property {Object[]} notifications - Raw notifications as returned from the API.
 * @property {Object[]} filtered - Notifications after applying type/read/order filters.
 * @property {boolean} loading - Indicates if notifications are being loaded.
 * @property {string|null} error - Error message when loading fails; null otherwise.
 * @property {string} typeFilter - Current type filter (e.g. "all" or a specific type).
 * @property {function(string): void} setTypeFilter - Setter for the type filter.
 * @property {string} readFilter - Current read filter ("all", "read", "unread").
 * @property {function(string): void} setReadFilter - Setter for the read filter.
 * @property {string} orderFilter - Current ordering ("asc" or "desc").
 * @property {function(string): void} setOrderFilter - Setter for the order filter.
 * @property {function(*): Promise<void>} markRead - Marks a single notification as read.
 * @property {function(): Promise<void>} markAll - Marks all notifications as read.
 */


/**
 * React hook that fetches and manages user notifications.
 *
 * It loads notifications for the given `userId` and provides helpers to
 * filter by type and read status, change ordering and mark notifications
 * as read individually or in bulk.
 *
 * @param {Object} [options] - Options containing the user id.
 * @param {(string|number)} [options.userId] - Identifier of the user whose notifications will be loaded.
 * @returns {UseNotificationsResult} Notifications, filters and actions.
 */
export function useNotifications({ userId } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("desc");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications(userId, controller.signal);
        setNotifications(data || []);
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError(err?.message || "Unable to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId]);

  const filtered = useMemo(() => {
    let data = [...notifications];
    if (typeFilter !== "all") data = data.filter((n) => n.type === typeFilter);
    if (readFilter === "unread") data = data.filter((n) => !n.isRead);
    if (readFilter === "read") data = data.filter((n) => n.isRead);
    data.sort((a, b) => {
      const t1 = new Date(a.timeStamp);
      const t2 = new Date(b.timeStamp);
      return orderFilter === "asc" ? t1 - t2 : t2 - t1;
    });
    return data;
  }, [notifications, typeFilter, readFilter, orderFilter]);

  async function markRead(id) {
    await markAsRead(id);
    const data = await fetchNotifications(userId);
    setNotifications(data || []);
  }

  async function markAll() {
    await markAllAsRead();
    const data = await fetchNotifications(userId);
    setNotifications(data || []);
  }

  return {
    notifications,
    filtered,
    loading,
    error,
    typeFilter,
    setTypeFilter,
    readFilter,
    setReadFilter,
    orderFilter,
    setOrderFilter,
    markRead,
    markAll,
  };
}

export default useNotifications;
