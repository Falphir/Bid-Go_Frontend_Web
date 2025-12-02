import React from "react";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/domain/NotificationCard";
import useNotifications from "../hooks/useNotifications";
import StatusMessage from "../components/feedback/StatusMessage";
import { useMe } from "../hooks/useMe";

// Página de notificações com filtros
export default function NotificationPage() {
  const { userId, loading: meLoading } = useMe();
  const {
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
  } = useNotifications({ userId });

  if (meLoading || loading)
    return (
      <StatusMessage type="loading">Loading notifications...</StatusMessage>
    );
  if (error) return <StatusMessage type="error">{error}</StatusMessage>;

  return (
    <div className="notif-wrapper">
      <div className="notif-card-container">
        <h2 className="notif-title">Notifications</h2>

        <button className="notif-mark-all" onClick={markAll}>
          Mark all as read
        </button>

        <div className="notif-filters">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="Accepted">Accepted Bids</option>
            <option value="Rejected">Rejected Bids</option>
            <option value="Canceled">Request Cancelled</option>
            <option value="New_message">New Message</option>
            <option value="Confirmed_Payment">Payment Confirmed</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>

        <div className="notif-list">
          {filtered.length === 0 && (
            <p className="notif-empty-page">No notifications found.</p>
          )}

          {filtered.map((n) => (
            <NotificationCard
              key={n.notificationId}
              notification={n}
              onMarkRead={(id) => markRead(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
