import React from "react";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaCommentDots,
    FaMoneyBillWave,
    FaBan,
} from "react-icons/fa";
import "./NotificationCard.css";

// Reusable component for a notification.
// Keeps the same CSS classes used in the original page.
export default function NotificationCard({ notification, onMarkRead }) {
    if (!notification) return null;
    const { notificationId, type, timeStamp, context, isRead } = notification;

    const iconForType = (t) => {
        switch (t) {
            case "Accepted":
                return <FaCheckCircle />;
            case "Rejected":
                return <FaTimesCircle />;
            case "Canceled":
                return <FaBan />;
            case "New_message":
                return <FaCommentDots />;
            case "Confirmed_Payment":
                return <FaMoneyBillWave />;
            default:
                return <FaCommentDots />;
        }
    };

    const labelForType = (t) => {
        switch (t) {
            case "Accepted":
                return "Bid Accepted";
            case "Rejected":
                return "Bid Rejected";
            case "Canceled":
                return "Request Canceled";
            case "New_message":
                return "New Message";
            case "Confirmed_Payment":
                return "Payment Confirmed";
            default:
                return "Notification";
        }
    };

    const handleClick = () => {
        if (!isRead) onMarkRead?.(notificationId);
    };

    return (
        <div
            key={notificationId}
            className={`notif-card fade-in ${!isRead ? "unread" : ""}`}
            onClick={handleClick}
        >
            <div className="notif-card-head">
                <div className="notif-icon-circle">{iconForType(type)}</div>
                <span className={`type-badge type-${type}`}>{labelForType(type)}</span>
                <span className="notif-date">
          {new Date(timeStamp).toLocaleString("en-US")}
        </span>
                {!isRead && <span className="notif-dot"></span>}
            </div>
            <div className="notif-card-text">{context}</div>
        </div>
    );
}
