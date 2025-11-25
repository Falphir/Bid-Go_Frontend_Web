import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/domain/NotificationCard";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    const [typeFilter, setTypeFilter] = useState("all");
    const [readFilter, setReadFilter] = useState("all");
    const [orderFilter, setOrderFilter] = useState("desc");

    const fetchNotifications = async () => {
        try {
            const meRes = await api.get("/auth/me");
            const claims = meRes.data?.claims || [];

            const getClaim = (type) =>
                claims.find((c) => c.type?.toLowerCase() === type.toLowerCase())?.value;

            const userId = getClaim("userId");
            if (!userId) return;

            const res = await api.get(`/notifications?userId=${userId}`);

            setNotifications(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        await api.patch(`/notifications/mark-read/${id}`);
        fetchNotifications();
    };

    const markAllAsRead = async () => {
        await api.patch(`/notifications/mark-all-read`);
        fetchNotifications();
    };

    useEffect(() => {
        let data = [...notifications];

        if (typeFilter !== "all") {
            data = data.filter((n) => n.type === typeFilter);
        }

        if (readFilter === "unread") {
            data = data.filter((n) => !n.isRead);
        }
        if (readFilter === "read") {
            data = data.filter((n) => n.isRead);
        }

        data.sort((a, b) => {
            const t1 = new Date(a.timeStamp);
            const t2 = new Date(b.timeStamp);
            return orderFilter === "asc" ? t1 - t2 : t2 - t1;
        });

        setFiltered(data);
    }, [typeFilter, readFilter, orderFilter, notifications]);

    if (loading)
        return <div className="notif-loading">Loading notifications...</div>;

    return (
        <div className="notif-wrapper">
            <div className="notif-card-container">
                <h2 className="notif-title">Notifications</h2>

                <button className="notif-mark-all" onClick={markAllAsRead}>
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
                            onMarkRead={(id) => markAsRead(id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
