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

    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaWd1ZWxAZ21haWwuY29tIiwidXNlcklkIjoiMiIsInVzZXJUeXBlIjoiQ29tcGFueSIsImV4cCI6MTc2Mjc5NjE3MSwiaXNzIjoiQmlkR29CYWNrZW5kIiwiYXVkIjoiQmlkR29Gcm9udGVuZCJ9.ha2HS12uB65oahVqFOH-g-XpwfKqqxPHuwMfDsTSVlI";


    useEffect(() => {
        if (!transportId) {
            console.error("❌ Transport ID indefinido! Verifica a rota ou o botão de navegação.");
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
                        `Erro ${err.response.status}: ${err.response.statusText} — ${JSON.stringify(
                            err.response.data
                        )}`
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

    // 🧮 Ordenação
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

    // 🔘 Botões Aceitar / Rejeitar
    const handleAccept = (bidId) => {
        console.log("✅ Aceitar bid", bidId);
        // Aqui você pode adicionar chamada à API de aceitar bid
    };

    const handleReject = (bidId) => {
        console.log("❌ Rejeitar bid", bidId);
        // Aqui você pode adicionar chamada à API de rejeitar bid
    };

    if (loading) return <p>Carregando...</p>;
    if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;

    return (
        <div className="acceptbids-container">
            {/* === SEÇÃO DO TRANSPORTE === */}
            {transport && (
                <div className="transport-section">
                    <img
                        src={transport.image || "https://via.placeholder.com/400x250"}
                        alt={transport.package || "Item"}
                        className="transport-image"
                    />
                    <div className="transport-info">
                        <h2 className="transport-title">{transport.package}</h2>
                        <div className="transport-details-grid">
                            <p><strong>Origem:</strong> {transport.origin}</p>
                            <p><strong>Destino:</strong> {transport.destination}</p>
                            <p><strong>Peso:</strong> {transport.weight} kg</p>
                            <p><strong>Dimensões:</strong> {transport.dimensions}</p>
                            <p><strong>Prazo máximo:</strong> {new Date(transport.maxDeliveryDate).toLocaleDateString()}</p>
                        </div>
                        <p className="obs"><strong>Observações:</strong> {transport.notes}</p>
                    </div>
                </div>
            )}

            {/* === SEÇÃO DAS LICITAÇÕES === */}
            <div className="bids-section">
                <div className="bids-header">
                    <h3>Licitações ativas</h3>
                    <div className="sort-controls">
                        <label>Ordenar por:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="value">Valor</option>
                            <option value="deadline">Prazo</option>
                        </select>
                        <button onClick={() => setAscending(!ascending)} className="order-btn">
                            {ascending ? "⬆️" : "⬇️"}
                        </button>
                    </div>
                </div>

                <div className="bids-list">
                    {sortedBids.length === 0 ? (
                        <p>Nenhuma licitação ativa encontrada.</p>
                    ) : (
                        sortedBids.map((bid) => (
                            <div className="bid-card" key={bid.bidId}>
                                <div className="bid-header">
                                    <div>
                                        <h4>Licitação #{bid.bidId}</h4>
                                        <p className="driver-info">
                                            <strong>{bid.driver?.name}</strong> — {bid.driver?.email}
                                        </p>
                                    </div>
                                    <span className="bid-value">{bid.value}€</span>
                                </div>

                                <div className="bid-meta">
                                    <p>
                                        <strong>Prazo de Entrega:</strong>{" "}
                                        {new Date(bid.deliveryDeadline).toLocaleDateString()}
                                    </p>
                                    <p className="obs-text">
                                        {bid.notes || "Sem observações adicionais."}
                                    </p>
                                </div>

                                <div className="bid-actions">
                                    <button className="accept-btn" onClick={() => handleAccept(bid.bidId)}>
                                        ✅ Aceitar
                                    </button>
                                    <button className="reject-btn" onClick={() => handleReject(bid.bidId)}>
                                        ❌ Rejeitar
                                    </button>
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
