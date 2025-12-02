import { useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationsService";

// Hook de notificações com filtros e marcação

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
