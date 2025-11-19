import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { useMe } from "../hooks/useMe";
import "../styles/HistoryPage.css";
import StatusMessage from "../components/feedback/StatusMessage";
import { normalizeHistoryDriver, normalizeHistoryCompany } from "../utils/normalizers";
import HistoryTable from "../components/data/HistoryTable";

function HistoryPage() {
  const { userId, isDriver, isCompany, loading: meLoading } = useMe();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = useMemo(() => {
    if (isDriver) {
      return [
        { key: "companyName", label: "Nome da Empresa" },
        { key: "package", label: "Mercadoria" },
        { key: "date", label: "Data" },
        { key: "destination", label: "Destino" },
        { key: "price", label: "Preço" },
        { key: "status", label: "Estado" },
        { key: "rating", label: "Avaliação" },
      ];
    }
    // Empresa
    return [
      { key: "requestId", label: "Id do pedido" },
      { key: "package", label: "Mercadoria" },
      { key: "driverName", label: "Nome do Motorista" },
      { key: "date", label: "Data" },
      { key: "destination", label: "Destino" },
      { key: "price", label: "Preço" },
      { key: "status", label: "Estado" },
    ];
  }, [isDriver]);

  // Normalizações movidas para utils/normalizers.js

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        let res;
        if (isDriver) {
          res = await api.get(`/history/driver/${userId}`, { signal: controller.signal });
          setItems(normalizeHistoryDriver(res.data));
        } else if (isCompany) {
          res = await api.get(`/history/company/${userId}`, { signal: controller.signal });
          setItems(normalizeHistoryCompany(res.data));
        } else {
          setItems([]);
        }
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError(
          err?.response?.data?.message || err?.message || "Não foi possível carregar o histórico."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [isDriver, isCompany, userId]);

  if (meLoading) return <StatusMessage type="loading">A validar sessão…</StatusMessage>;
  if (loading) return <StatusMessage type="loading">A carregar histórico…</StatusMessage>;
  if (error) return <StatusMessage type="error">{error}</StatusMessage>;

  const isEmpty = !items || items.length === 0;
  const title = isDriver
    ? "Histórico de Licitações"
    : isCompany
    ? "Histórico de TransportRequests"
    : "Histórico";

  return (
    <div className="history-page">
      <h2 className="section-title">{title}</h2>
      <HistoryTable columns={columns} rows={items} emptyMessage="Sem registos para apresentar." />
    </div>
  );
}

export default HistoryPage;
