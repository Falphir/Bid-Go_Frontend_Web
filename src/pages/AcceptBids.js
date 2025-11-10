import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AcceptBids.css";
import { useParams } from "react-router-dom";

function AcceptBids() {
  const { id } = useParams();
  const transportId = id;
  const [transport, setTransport] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("value");
  const [ascending, setAscending] = useState(true);

  // TODO: replace with token from context or auth provider.  This
  // sample token is hard‑coded purely for demonstration.
  const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaWd1ZWxAZ21haWwuY29tIiwidXNlcklkIjoiMiIsInVzZXJUeXBlIjoiQ29tcGFueSIsImV4cCI6MTc2MjgwNjQ1MiwiaXNzIjoiQmlkR29CYWNrZW5kIiwiYXVkIjoiQmlkR29Gcm9udGVuZCJ9.t-hnGitN1MnDjEmiv4WpQVU3m3B0FBAojLT1dZl6-eQ";

  useEffect(() => {
    if (!transportId) {
      console.error(
        "❌ Transport ID indefinido! Verifica a rota ou o botão de navegação."
      );
      setError("ID do transporte não encontrado.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Buscando transporte ID:", transportId);

        // 1️⃣ Buscar detalhes do transporte
        const transportRes = await axios.get(
          `https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/transports/${transportId}`,
          {
            headers: { Authorization: token },
            signal: controller.signal,
          }
        );
        setTransport(transportRes.data);

        // 2️⃣ Buscar licitações ativas (vinculadas ou não ao transporte)
        const bidsRes = await axios.get(
          `https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/bids/bidsActive?transportRequestId=${transportId}`,
          {
            headers: { Authorization: token },
            signal: controller.signal,
          }
        );
        setBids(bidsRes.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("❌ Erro ao buscar dados:", err);
        if (err.response) {
          setError(
            `Erro ${err.response.status}: ${
              err.response.statusText
            } — ${JSON.stringify(err.response.data)}`
          );
        } else {
          setError(`Erro: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [transportId, token]);

  // 🧮 Ordenação de licitações
  const sortedBids = [...bids].sort((a, b) => {
    if (sortBy === "value") {
      return ascending ? a.value - b.value : b.value - a.value;
    } else if (sortBy === "deadline") {
      const dateA = new Date(a.deliveryDeadline);
      const dateB = new Date(b.deliveryDeadline);
      return ascending ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  // 🔘 Handlers para aceitar / rejeitar licitação (API call placeholder)
  const handleAccept = (bidId) => {
    console.log("✅ Aceitar licitação", bidId);
    // Aqui você pode adicionar chamada à API de aceitar bid
  };

  const handleReject = (bidId) => {
    console.log("❌ Rejeitar licitação", bidId);
    // Aqui você pode adicionar chamada à API de rejeitar bid
  };

  if (loading) return <p className="status-message">Carregando…</p>;
  if (error) return <p className="status-message error">Erro: {error}</p>;

  return (
    <div className="acceptbids-container">
      {/* === Cabeçalho do transporte === */}
      {transport && (
        <>
          {/* Título do item */}
          <h2 className="page-title">
            {transport.package}
            {transport.description ? ` (${transport.description})` : ""}
          </h2>
          <div className="transport-card">
            <img
              src={transport.image || "https://via.placeholder.com/400x250"}
              alt={transport.package || "Item"}
              className="transport-image"
            />
            <div className="transport-details">
              <div className="details-grid">
                <div>
                  <span className="detail-label">Origem:</span>{" "}
                  {transport.origin}
                </div>
                <div>
                  <span className="detail-label">Destino:</span>{" "}
                  {transport.destination}
                </div>
                <div>
                  <span className="detail-label">Peso (kg):</span>{" "}
                  {transport.weight}
                </div>
                <div>
                  <span className="detail-label">Dimensões (cm):</span>{" "}
                  {transport.dimensions}
                </div>
                <div>
                  <span className="detail-label">Prazo máximo:</span>{" "}
                  {transport.maxDeliveryDate
                    ? new Date(transport.maxDeliveryDate).toLocaleDateString()
                    : "—"}
                </div>
              </div>
              {transport.notes && (
                <div className="notes-box">
                  <strong>Observações adicionais:</strong> {transport.notes}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* === Seção de licitações === */}
      <div className="bids-section">
        <div className="bids-header">
          <h3>Licitações ativas</h3>
          <div className="sort-controls">
            <label>Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="value">Valor</option>
              <option value="deadline">Prazo</option>
            </select>
            <button
              type="button"
              onClick={() => setAscending(!ascending)}
              className="order-btn"
              aria-label="Alterar ordem"
            >
              {ascending ? "⬆" : "⬇"}
            </button>
          </div>
        </div>
        <div className="bids-list">
          {sortedBids.length === 0 ? (
            <p className="no-bids">Nenhuma licitação ativa encontrada.</p>
          ) : (
            sortedBids.map((bid) => (
              <div className="bid-card" key={bid.bidId}>
                <div className="bid-info">
                  <h4 className="bid-title">Licitação nº{bid.bidId}</h4>
                  <p className="bid-driver">
                    Licitação por {bid.driver?.name || "—"}
                    {bid.driver?.rating ? (
                      <span className="bid-rating"> {bid.driver.rating}★</span>
                    ) : null}
                  </p>
                  <p className="bid-value">
                    Valor da Licitação: <span>{bid.value}€</span>
                  </p>
                  <p className="bid-deadline">
                    Prazo de Entrega:{" "}
                    {bid.deliveryDeadline
                      ? new Date(bid.deliveryDeadline).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="bid-right">
                  <div className="bid-notes-box">
                    <strong>Observações adicionais:</strong>{" "}
                    {bid.notes || "Sem observações adicionais."}
                  </div>
                  <div className="bid-buttons">
                    <button
                      type="button"
                      className="accept-btn"
                      onClick={() => handleAccept(bid.bidId)}
                    >
                      Aceitar
                    </button>
                    <button
                      type="button"
                      className="reject-btn"
                      onClick={() => handleReject(bid.bidId)}
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AcceptBids;
