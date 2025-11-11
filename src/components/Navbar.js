import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Navbar.css";
import Logo from "../assets/logo.png";
import UserImage from "../assets/person.png";

function Navbar() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const dropdownRef = useRef(null);

    const token =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaWd1ZWxAZ21haWwuY29tIiwidXNlcklkIjoiMiIsInVzZXJUeXBlIjoiQ29tcGFueSIsImV4cCI6MTc2Mjc5NjE3MSwiaXNzIjoiQmlkR29CYWNrZW5kIiwiYXVkIjoiQmlkR29Gcm9udGVuZCJ9.ha2HS12uB65oahVqFOH-g-XpwfKqqxPHuwMfDsTSVlI";

    const userId = 2; // substitui com o ID real do utilizador logado

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(
                `https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/notifications/${userId}`,
                {
                    headers: { Authorization: token },
                }
            );
            setNotifications(res.data);
            setHasNew(res.data.some((n) => !n.isRead));
        } catch (err) {
            console.error("Erro ao buscar notificações:", err);
        }
    };

    // Fecha o dropdown se clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpen = () => {
        setOpen(!open);
        if (!open) setHasNew(false);
    };

    return (
        <header className="header">
            <div className="logo">
                <img src={Logo} height={36} alt="Bid&Go Logo" />
            </div>

            <div className="user-info" ref={dropdownRef}>
                {/* 🔔 Ícone de notificações */}
                <div className="notifications-wrapper" onClick={handleOpen}>
                    <span className="notifications" role="img" aria-label="notificações">
                        🔔
                    </span>
                    {hasNew && <span className="notif-dot" />}
                </div>

                {/* Dropdown de notificações */}
                {open && (
                    <div className="notif-dropdown">
                        <h4>Notificações</h4>
                        {notifications.length === 0 ? (
                            <p className="notif-empty">Sem notificações recentes</p>
                        ) : (
                            notifications
                                .slice(0, 5)
                                .map((n) => (
                                    <div
                                        key={n.id}
                                        className={`notif-item ${!n.isRead ? "unread" : ""}`}
                                    >
                                        <p>{n.message}</p>
                                        <small>{new Date(n.dateCreated).toLocaleString()}</small>
                                    </div>
                                ))
                        )}
                    </div>
                )}

                {/* Perfil da empresa */}
                <div className="company">
                    <img src={UserImage} height={36} alt="User" />
                    <div className="company-text">
                        <span className="company-name">Continente</span>
                        <span className="company-type">Empresa</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
