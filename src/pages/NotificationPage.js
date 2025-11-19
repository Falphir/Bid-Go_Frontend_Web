import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/domain/NotificationCard";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
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
      console.error("Erro ao buscar notificações:", err);
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

  // Atualiza lista filtrada quando filtros mudam
  useEffect(() => {
    let data = [...notifications];

    // Filtro: tipo
    if (typeFilter !== "all") {
      data = data.filter((n) => n.type === typeFilter);
    }

    // Filtro: lidas / não lidas
    if (readFilter === "unread") {
      data = data.filter((n) => !n.isRead);
    }
    if (readFilter === "read") {
      data = data.filter((n) => n.isRead);
    }

    // Ordenação
    data.sort((a, b) => {
      const t1 = new Date(a.timeStamp);
      const t2 = new Date(b.timeStamp);
      return orderFilter === "asc" ? t1 - t2 : t2 - t1;
    });

    setFiltered(data);
  }, [typeFilter, readFilter, orderFilter, notifications]);

  if (loading)
    return <div className="notif-loading">A carregar notificações...</div>;

  // ícones e labels movidos para NotificationCard

  return (
    <div className="notif-wrapper">
      <div className="notif-card-container">
        <h2 className="notif-title">Notificações</h2>

        <button className="notif-mark-all" onClick={markAllAsRead}>
          Marcar todas como lidas
        </button>

        <div className="notif-filters">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="Accepted">Bids Aceites</option>
            <option value="Rejected">Bids Rejeitadas</option>
            <option value="Canceled">Pedido Cancelado</option>
            <option value="New_message">Nova Mensagem</option>
            <option value="Confirmed_Payment">Pagamento confirmado</option>
          </select>
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="unread">Não lidas</option>
            <option value="read">Lidas</option>
          </select>

          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigas</option>
          </select>
        </div>

        <div className="notif-list">
          {filtered.length === 0 && (
            <p className="notif-empty-page">Nenhuma notificação encontrada.</p>
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
