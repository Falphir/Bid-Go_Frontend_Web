import React, { useEffect, useState } from "react";
import "./Navbar.css";
import Logo from "../../assets/logo.png";
import DefaultUser from "../../assets/person.png";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCommentDots,
  FaMoneyBillWave,
  FaBan,
} from "react-icons/fa";

/**
 * Top navigation bar displaying the application logo, the current user
 * information and a notifications dropdown.
 *
 * It fetches the current user from `/auth/me`, loads a small set of
 * recent notifications and exposes links to profile, history,
 * notifications, my bids/transports and logout.
 *
 * @returns {JSX.Element} Rendered navigation bar.
 */
export default function Navbar() {
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meRes = await api.get("/auth/me");
        const claims = meRes.data?.claims || [];

        const getClaim = (type) =>
          claims.find((c) => c.type?.toLowerCase() === type.toLowerCase())
            ?.value;

        const userId = getClaim("userId");
        const userType = getClaim("userType");

        if (!userId) return;

        const profilePromise = api.get(`/profile/${userId}`);
        setNotifLoading(true);
        const notifPromise = api.get(`/notifications?userId=${userId}`);

        const [profileRes, notifRes] = await Promise.all([
          profilePromise,
          notifPromise,
        ]);
        const profile = profileRes.data;
        const notifications = notifRes.data || [];
        const unread = notifications.filter((n) => !n.isRead).length;

        setLatestNotifications(
          notifications
            .sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))
            .slice(0, 5)
        );
        setUnreadCount(unread);
        setNotifLoading(false);

        setUser({
          name: profile.name || "User",
          role: userType || "No type",
          avatar: profile.profileImage || DefaultUser,
        });
      } catch (err) {
        console.warn("Error loading navbar:", err);
      }
    };

    fetchUser();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch(`/notifications/mark-all-read`);
      const meRes = await api.get("/auth/me");
      const claims = meRes.data?.claims || [];
      const getClaim = (type) =>
        claims.find((c) => c.type?.toLowerCase() === type.toLowerCase())?.value;
      const userId = getClaim("userId");
      if (!userId) return;
      setNotifLoading(true);
      const notifRes = await api.get(`/notifications?userId=${userId}`);
      const notifications = notifRes.data || [];
      setLatestNotifications(
        notifications
          .sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))
          .slice(0, 5)
      );
      setUnreadCount(0);
    } catch (e) {
      console.warn("Failed to mark all as read", e);
    } finally {
      setNotifLoading(false);
    }
  };

  const iconForType = (type) => {
    switch (type) {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")}>
        <img
          src={Logo}
          height={36}
          alt="Bid&Go"
          style={{ cursor: "pointer" }}
        />
      </div>

      <div className="user-info">
        <div className="notifications-wrapper">
          <span
            className="notifications"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            aria-label="Open notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span
                className="notif-badge"
                aria-label={`You have ${unreadCount} unread notifications`}
              >
                {unreadCount}
              </span>
            )}
          </span>

          {notifDropdownOpen && (
            <div
              className="notif-dropdown"
              role="dialog"
              aria-label="Latest notifications"
            >
              <div className="notif-dropdown-header">
                <h4>Notifications</h4>
                {latestNotifications.length > 0 && unreadCount > 0 && (
                  <button
                    className="notif-mark-all-btn"
                    onClick={markAllAsRead}
                  >
                    Mark all
                  </button>
                )}
              </div>

              {notifLoading && <p className="notif-empty">Loading...</p>}
              {!notifLoading && latestNotifications.length === 0 && (
                <p className="notif-empty">No notifications</p>
              )}

              {!notifLoading && latestNotifications.length > 0 && (
                <div className="notif-dropdown-list">
                  {latestNotifications.map((n) => (
                    <div
                      key={n.notificationId}
                      className={`notif-item ${n.isRead ? "" : "unread"}`}
                      onClick={() => {
                        navigate("/notifications");
                        setNotifDropdownOpen(false);
                      }}
                    >
                      <div className="notif-line">
                        <div className="notif-icon-circle">
                          {iconForType(n.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p className="notif-text">{n.context}</p>
                          <div className="notif-meta">
                            <span className="notif-date">
                              {new Date(n.timeStamp).toLocaleDateString(
                                "en-GB"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="notif-see-all"
                onClick={() => {
                  navigate("/notifications");
                  setNotifDropdownOpen(false);
                }}
              >
                See all →
              </button>
            </div>
          )}
        </div>

        {!user && (
          <div className="user-box placeholder">
            <img src={DefaultUser} className="avatar" alt="loading" />
            <div className="user-text">
              <span className="user-name">Loading...</span>
              <span className="user-role">---</span>
            </div>
          </div>
        )}

        {user && (
          <div className="user-box" onClick={() => setOpenMenu(!openMenu)}>
            <img
              src={user.avatar || DefaultUser}
              alt="Avatar"
              className="avatar"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DefaultUser;
              }}
            />

            <div className="user-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>

            {openMenu && (
              <div className="dropdown-menu">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <button onClick={() => navigate("/history")}>History</button>
                <button onClick={() => navigate("/notifications")}>
                  Notifications
                </button>
                {user?.role && user.role.toLowerCase().includes("driver") && (
                  <button onClick={() => navigate("/myBids")}>My Bids</button>
                )}

                {user?.role && user.role.toLowerCase().includes("company") && (
                  <button onClick={() => navigate("/myTransports")}>
                    My Transports
                  </button>
                )}
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
