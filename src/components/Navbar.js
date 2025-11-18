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
                <span className="notifications">🔔</span>

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
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
