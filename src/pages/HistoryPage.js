import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { useMe } from "../hooks/useMe";
import "../styles/HistoryPage.css";

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

  const fmtDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const normalizeDriver = (data) => {
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.results)
      ? data.results
      : [];
    return arr.map((t) => {
      const companyName = t.companyName ?? t.company?.name ?? t.company ?? "—";
      const pkg = t.package ?? t.cargo ?? t.goods ?? t.title ?? "—";
      const destination = t.destination ?? t.to ?? t.route?.to ?? "—";
      const price = t.price ?? t.value ?? t.amount ?? t.maxPrice ?? "—";
      const status = t.status ?? t.state ?? "—";
      const rating = t.rating ?? t.evaluation ?? t.score ?? "—";
      const dateRaw = t.date ?? t.createdAt ?? t.updatedAt ?? t.biddingEndDate ?? t.deliveryDate ?? null;
      return {
        companyName,
        package: pkg,
        date: fmtDate(dateRaw),
        destination,
        price,
        status,
        rating,
        requestId: t.id ?? t.requestId ?? t.transportRequestId ?? t.transportId ?? null,
      };
    });
  };

  const normalizeCompany = (data) => {
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.results)
      ? data.results
      : [];
    return arr.map((t) => {
      const requestId = t.id ?? t.requestId ?? t.transportRequestId ?? t.transportId ?? null;
      const pkg = t.package ?? t.cargo ?? t.goods ?? t.title ?? "—";
      const driverName = t.driverName ?? t.name ?? t.driver?.name ?? t.driver ?? "—";
      const destination = t.destination ?? t.to ?? t.route?.to ?? "—";
      const price = t.price ?? t.value ?? t.amount ?? t.maxPrice ?? "—";
      const status = t.status ?? t.state ?? "—";
      const dateRaw = t.date ?? t.createdAt ?? t.updatedAt ?? t.biddingEndDate ?? t.deliveryDate ?? null;
      return {
        requestId,
        package: pkg,
        driverName,
        date: fmtDate(dateRaw),
        destination,
        price,
        status,
      };
    });
  };

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
          setItems(normalizeDriver(res.data));
        } else if (isCompany) {
          res = await api.get(`/history/company/${userId}`, { signal: controller.signal });
          setItems(normalizeCompany(res.data));
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

  if (meLoading) return <p className="status-message">A validar sessão…</p>;
  if (loading) return <p className="status-message">A carregar histórico…</p>;
  if (error) return <p className="status-message error">{error}</p>;

  const isEmpty = !items || items.length === 0;

  return (
    <div className="history-page">
      <h2 className="section-title">Histórico</h2>
      {isEmpty ? (
        <p className="no-bids">Sem registos para apresentar.</p>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={row.requestId ?? row.id ?? idx}>
                  {columns.map((c) => (
                    <td key={c.key}>{row[c.key] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
