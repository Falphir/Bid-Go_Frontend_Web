import React, { useEffect, useState } from "react";
import "../styles/BidGoPage.css";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router";
import Countdown from "../components/Countdown";
import { useMe } from "../hooks/useMe";

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

  // 👁️ Toggle para a sidebar de filtros
  const [showFilters, setShowFilters] = useState(true);

  // Abre/fecha automaticamente consoante o ecrã na 1ª renderização
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 1100) setShowFilters(false);
    }
  }, []);

  // 🧩 Normalizar resposta da API
  const normalizeList = (data) => {
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.results)
      ? data.results
      : [];

    return arr.map((t) => ({
      id: t.id ?? t.transportRequestId ?? t.transportId,
      image: t.image ?? "https://via.placeholder.com/400x250",
      package: t.package ?? t.title ?? "Pedido",
      route: t.route ?? "",
      origin: t.origin ?? t.from ?? "—",
      destination: t.destination ?? t.to ?? "—",
      maxPrice: t.maxPrice ?? t.maxBudget ?? "—",
      timeRemaining: t.timeRemaining ?? "",
      biddingEndDate:
        t.biddingEndDate ?? t.biddingEnd ?? t.bidding_end_date ?? null,
      status: t.status ?? null,
    }));
  };

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
      const normalized = normalizeList(res?.data);
      setRequests(normalized);
      if (normalized.length === 0) setIsRequestsEmpty(true);
    } catch (err) {
      if (api.isCancel?.(err) || err.name === "CanceledError") return;
      if (err.response) {
        setError(`Server error: ${err.response.status} ${err.response.statusText}`);
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
      const url = qs ? `/pageTransports/filters?${qs}` : `/pageTransports/filters`;
      const res = await api.get(url, { signal });
      const normalized = normalizeList(res?.data);
      setRequests(normalized);
      if (normalized.length === 0) setIsRequestsEmpty(true);
    } catch (err) {
      if (api.isCancel?.(err) || err.name === "CanceledError") return;
      if (err.response) {
        setError(`Server error: ${err.response.status} ${err.response.statusText}`);
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
  if (meLoading) return <p className="status-message">A validar sessão…</p>;
  if (loading) return <p className="status-message">A carregar transportes…</p>;
  if (error) return <p className="status-message error">{error}</p>;

  const list = Array.isArray(requests) ? requests : [];
  const isEmpty = list.length === 0 || isRequestsEmpty;

  return (
    <div className="page-container">
      <main className="main-content">
        <h2 className="section-title">
          {isDriver ? "Transportes Disponíveis para Licitar" : "Pedidos de Transporte"}
        </h2>

        {!isDriver && (
          <button className="new-request-btn" onClick={() => navigate("/createRequest")}>
            Novo Pedido de Transporte
          </button>
        )}

        {/* Botão flutuante para abrir/fechar filtros */}
        {isDriver && (
          <button
            className={`filters-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            aria-controls="filtersPanel"
          >
            {showFilters ? "Esconder filtros" : "Mostrar filtros"}
          </button>
        )}

  {/* Painel lateral de filtros (Driver) */}
        {isDriver && (
          <div
            id="filtersPanel"
            className={`filters-sidebar ${showFilters ? "open" : ""}`}
            role="complementary"
            aria-label="Filtros de pesquisa"
          >
            <div className="filters-header">
              <h4 className="filters-title">Filtros</h4>
              <button
                type="button"
                className="filters-close"
                aria-label="Fechar filtros"
                onClick={() => setShowFilters(false)}
              >
                ×
              </button>
            </div>

            <form
              className="filters-bar"
              onSubmit={(e) => {
                e.preventDefault();
                const controller = new AbortController();
                fetchDriverTransports(controller.signal, filters);
                setTimeout(() => controller.abort(), 30000);
              }}
            >

              <div className="filters-row">
                <input
                  type="text"
                  placeholder="Origem"
                  value={filters.origin}
                  onChange={(e) => setFilters((f) => ({ ...f, origin: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Destino"
                  value={filters.destination}
                  onChange={(e) => setFilters((f) => ({ ...f, destination: e.target.value }))}
                />
                <select
                  value={filters.priceOrder}
                  onChange={(e) => setFilters((f) => ({ ...f, priceOrder: e.target.value }))}
                >
                  <option value="">Preço</option>
                  <option value="asc">Mais barato</option>
                  <option value="desc">Mais caro</option>
                </select>
              </div>

              <div className="filters-actions">
                <button type="submit" className="bid-btn">Aplicar</button>
                <button
                  type="button"
                  className="bid-btn"
                  onClick={() => {
                    const cleared = { origin: "", destination: "", deliveryDate: "", priceOrder: "" };
                    setFilters(cleared);
                    const controller = new AbortController();
                    fetchDriverTransports(controller.signal, cleared);
                    setTimeout(() => controller.abort(), 30000);
                  }}
                >
                  Limpar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="cards-container">
          {isEmpty ? (
            <p className="no-bids">Nenhum pedido encontrado.</p>
          ) : (
            list.map((req) => {
              const transport = req;

              // Resolver o status
              const statusRaw = req?.status ?? null;
              const statusText = (() => {
                if (statusRaw == null) return null;
                if (typeof statusRaw === "number") {
                  switch (statusRaw) {
                    case 0: return "Active";
                    case 1: return "Canceled";
                    case 2: return "Completed";
                    case 3: return "Pending";
                    case 4: return "InTransit";
                    case 5: return "Draft";
                    case 6: return "WaitingPickup";
                    default: return String(statusRaw);
                  }
                }
                if (typeof statusRaw === "boolean") return statusRaw ? "Canceled" : "Active";
                return String(statusRaw);
              })();

              const statusClass = statusText ? `status-${statusText.toLowerCase()}` : "";

              // Corrigir data de fim de leilão
              let endDate = transport?.biddingEndDate
                ? new Date(transport.biddingEndDate)
                : null;
              // Alguns endpoints (ex.: driver) devolvem apenas "timeRemaining" (segundos restantes)
              if (!endDate && transport?.timeRemaining != null) {
                const tr = transport.timeRemaining;
                if (typeof tr === "number" && isFinite(tr)) {
                  endDate = new Date(Date.now() + tr * 1000);
                } else if (typeof tr === "string") {
                  const n = Number(tr);
                  if (!Number.isNaN(n) && isFinite(n)) {
                    endDate = new Date(Date.now() + n * 1000);
                  }
                }
              }

              return (
                <div className="card" key={req.id}>
                  <div className="card-image">
                    <img src={req.image} alt={req.package} />
                  </div>

                  <div className="card-body">
                    <div className="title-with-badge">
                      <h3 className="card-title">{req.package}</h3>
                      {statusText && <span className={`status-badge ${statusClass}`}>{statusText}</span>}
                    </div>

                    <p className="card-route">{req.route}</p>
                    <div>
                      {req.origin} → {req.destination}
                    </div>
                    <div>
                      <span className="label-small">Max Price:</span>{" "}
                      {req.maxPrice}€
                    </div>

                    <p className="card-time">
                      Tempo Restante:{" "}
                      {endDate ? (
                        <Countdown endDate={endDate} />
                      ) : transport?.timeRemaining ? (
                        String(transport.timeRemaining)
                      ) : (
                        "—"
                      )}
                    </p>

                    <button
                      className="bid-btn"
                      onClick={() => navigate(`/accept-bids/${req.id}`)}
                    >
                      Licitações Abertas
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default BidGoPage;
