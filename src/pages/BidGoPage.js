import React, { useEffect, useState } from "react";
import "../styles/BidGoPage.css";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router";
import { useMe } from "../hooks/useMe";
import TransportCard from "../components/domain/TransportCard";
import StatusMessage from "../components/feedback/StatusMessage";
import FiltersPanel from "../components/form/FiltersPanel";
import { normalizeTransportList } from "../utils/normalizers";

function BidGoPage() {
  const [requests, setRequests] = useState([]);
  const [isRequestsEmpty, setIsRequestsEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { role, userId, isDriver, isCompany, loading: meLoading } = useMe();

  // 🔎 Filtros (apenas usados para Driver)
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    deliveryDate: "", // asc | desc
    priceOrder: "", // asc | desc
  });

  // 👁️ Toggle para filtros (fechado por omissão)
  const [showFilters, setShowFilters] = useState(false);

  // Normalização agora em utils/normalizers.js (normalizeTransportList)

  // Helpers
  const buildQuery = (f) => {
    const params = new URLSearchParams();
    if (f.origin) params.append("origin", f.origin);
    if (f.destination) params.append("destination", f.destination);
    if (f.deliveryDate) params.append("deliveryDate", f.deliveryDate); // asc | desc
    if (f.priceOrder) params.append("priceOrder", f.priceOrder); // asc | desc
    return params.toString();
  };

  const fetchCompanyTransports = async (signal) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setIsRequestsEmpty(false);
    try {
      const res = await api.get(`/transports/company/${userId}`, { signal });
      const normalized = normalizeTransportList(res?.data);
      setRequests(normalized);
      if (normalized.length === 0) setIsRequestsEmpty(true);
    } catch (err) {
      if (api.isCancel?.(err) || err.name === "CanceledError") return;
      if (err.response) {
        setError(
          `Server error: ${err.response.status} ${err.response.statusText}`
        );
      } else if (err.request) {
        setError("Network error: no response from server");
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverTransports = async (signal, currentFilters) => {
    setLoading(true);
    setError(null);
    setIsRequestsEmpty(false);
    try {
      const qs = buildQuery(currentFilters || filters);
      const url = qs
        ? `/pageTransports/filters?${qs}`
        : `/pageTransports/filters`;
      const res = await api.get(url, { signal });
      const normalized = normalizeTransportList(res?.data);
      setRequests(normalized);
      if (normalized.length === 0) setIsRequestsEmpty(true);
    } catch (err) {
      if (api.isCancel?.(err) || err.name === "CanceledError") return;
      if (err.response) {
        setError(
          `Server error: ${err.response.status} ${err.response.statusText}`
        );
      } else if (err.request) {
        setError("Network error: no response from server");
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Buscar dados consoante o tipo de utilizador
  useEffect(() => {
    const controller = new AbortController();
    if (isCompany && userId) {
      fetchCompanyTransports(controller.signal);
    } else if (isDriver) {
      fetchDriverTransports(controller.signal);
    }
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver, isCompany, userId]);

  // 🕐 Estados de carregamento
  if (meLoading)
    return <StatusMessage type="loading">A validar sessão…</StatusMessage>;
  if (loading)
    return (
      <StatusMessage type="loading">A carregar transportes…</StatusMessage>
    );
  if (error) return <StatusMessage type="error">{error}</StatusMessage>;

  const list = Array.isArray(requests) ? requests : [];
  const isEmpty = list.length === 0 || isRequestsEmpty;

  return (
    <div className="page-container">
      <main className="main-content">
        {isDriver && (
          <div className="filters-top-wrapper">
            <button
              type="button"
              className={`filters-toggle-top ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              aria-controls="filtersTopPanel"
            >
              {showFilters ? "Esconder filtros" : "Mostrar filtros"}
            </button>

            {showFilters && (
              <FiltersPanel
                initialFilters={filters}
                onApply={(f) => {
                  setFilters(f);
                  const controller = new AbortController();
                  fetchDriverTransports(controller.signal, f);
                  setTimeout(() => controller.abort(), 30000);
                }}
                onClear={(cleared) => {
                  setFilters(cleared);
                  const controller = new AbortController();
                  fetchDriverTransports(controller.signal, cleared);
                  setTimeout(() => controller.abort(), 30000);
                }}
              />
            )}
          </div>
        )}

        <h2 className="section-title">
          {isDriver
            ? "Transportes Disponíveis para Licitar"
            : "Pedidos de Transporte"}
        </h2>

        {!isDriver && (
          <button
            className="new-request-btn"
            onClick={() => navigate("/createRequest")}
          >
            Novo Pedido de Transporte
          </button>
        )}
        <div className="cards-container">
          {isEmpty ? (
            <p className="no-bids">Nenhum pedido encontrado.</p>
          ) : (
            list.map((req) => (
              <TransportCard
                key={req.id}
                data={req}
                isCompany={isCompany}
                isDriver={isDriver}
                onView={(id) => navigate(`/transportRequest/${id}`)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default BidGoPage;
