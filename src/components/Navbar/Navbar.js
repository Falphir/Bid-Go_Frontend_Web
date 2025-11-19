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
          name: profile.name || "Utilizador",
          role: userType || "Sem tipo",
          avatar: profile.profileImage || "/Images/default-avatar.png",
        });
      } catch (err) {
        console.warn("Erro a carregar navbar:", err);
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
      console.warn("Falha ao marcar todas como lidas", e);
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
      <div className="logo">
        <img src={Logo} height={36} alt="Bid&Go" />
      </div>

      <div className="user-info">
        <div className="notifications-wrapper">
          <span
            className="notifications"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            aria-label="Abrir notificações"
          >
            🔔
            {unreadCount > 0 && (
              <span
                className="notif-badge"
                aria-label={`Tem ${unreadCount} notificações não lidas`}
              >
                {unreadCount}
              </span>
            )}
          </span>

          {notifDropdownOpen && (
            <div
              className="notif-dropdown"
              role="dialog"
              aria-label="Últimas notificações"
            >
              <div className="notif-dropdown-header">
                <h4>Notificações</h4>
                {latestNotifications.length > 0 && unreadCount > 0 && (
                  <button
                    className="notif-mark-all-btn"
                    onClick={markAllAsRead}
                  >
                    Marcar tudo
                  </button>
                )}
              </div>

              {notifLoading && <p className="notif-empty">A carregar...</p>}
              {!notifLoading && latestNotifications.length === 0 && (
                <p className="notif-empty">Sem notificações</p>
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
                                "pt-PT"
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
                Ver todas →
              </button>
            </div>
          )}
        </div>

        {!user && (
          <div className="user-box placeholder">
            <img src={DefaultUser} className="avatar" alt="loading" />
            <div className="user-text">
              <span className="user-name">A carregar...</span>
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
            />

            <div className="user-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>

            {openMenu && (
              <div className="dropdown-menu">
                <button onClick={() => navigate("/profile")}>Perfil</button>
                <button onClick={() => navigate("/history")}>Histórico</button>
                <button onClick={() => navigate("/notifications")}>
                  Notificações
                </button>
                {user?.role && user.role.toLowerCase().includes("driver") && (
                  <button onClick={() => navigate("/myBids")}>
                    Minhas Bids
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
