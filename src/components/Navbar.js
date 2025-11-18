import React, { useEffect, useState } from "react";
import "./Navbar.css";
import Logo from "../assets/logo.png";
import DefaultUser from "../assets/person.png";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [latestNotifications, setLatestNotifications] = useState([]);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                // --- Primeiro: buscar /auth/me
                const meRes = await api.get("/auth/me");
                const claims = meRes.data?.claims || [];

                const getClaim = (type) =>
                    claims.find(c => c.type?.toLowerCase() === type.toLowerCase())?.value;

                const userId = getClaim("userId");
                const userType = getClaim("userType");

                if (!userId) return;


                const profilePromise = api.get(`/profile/${userId}`);

                const [profileRes] = await Promise.all([profilePromise]);
                const profile = profileRes.data;
// Buscar notificações não lidas
                const notifRes = await api.get(`/notifications?userId=${userId}`);
                const unread = notifRes.data.filter(n => !n.isRead).length;

                setLatestNotifications(
                    notifRes.data
                        .sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))
                        .slice(0, 5)
                );

                setUnreadCount(unread);

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
    >
        🔔
        {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount}</span>
        )}
    </span>

                    {notifDropdownOpen && (
                        <div className="notif-dropdown">
                            {latestNotifications.length === 0 ? (
                                <p className="notif-empty">Sem notificações</p>
                            ) : (
                                latestNotifications.map(n => (
                                    <div
                                        key={n.notificationId}
                                        className={`notif-item ${n.isRead ? "" : "unread"}`}
                                        onClick={() => {
                                            navigate("/notifications");
                                            setNotifDropdownOpen(false);
                                        }}
                                    >
                                        <p className="notif-text">{n.context}</p>
                                        <span className="notif-date">
                            {new Date(n.timeStamp).toLocaleDateString("pt-PT")}
                        </span>
                                    </div>
                                ))
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



                {/* SKELETON antes dos dados carregarem */}
                {!user && (
                    <div className="user-box placeholder">

                    <img src={DefaultUser} className="avatar" alt="loading" />
                        <div className="user-text">
                            <span className="user-name">A carregar...</span>
                            <span className="user-role">---</span>
                        </div>
                    </div>
                )}

                {/* Dados reais */}
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
                                <button onClick={() => navigate("/notifications")}>Notificações</button>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
