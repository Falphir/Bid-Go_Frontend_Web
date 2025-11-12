import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AcceptBids.css";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import Countdown from "../components/Countdown";


function AcceptBids() {
    const { id } = useParams();
    const transportId = id;
    const [transport, setTransport] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("value");
    const [ascending, setAscending] = useState(true);

    // Estado do modal e toast
    const [confirmAction, setConfirmAction] = useState(null); // {type, bidId}
    const [toast, setToast] = useState(null);
    const [processing, setProcessing] = useState(null); // bidId que está em ação

    useEffect(() => {
        if (!transportId) {
            setError("ID do transporte não encontrado.");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const transportRes = await api.get(`/transports/${transportId}`);
                setTransport(transportRes.data);

                const bidsRes = await api.get(`/bids/bidsActive?transportRequestId=${transportId}`);
                const bidsData = bidsRes.data;


                const updatedBids = await Promise.all(
                    bidsData.map(async (bid) => {
                        try {
                            const ratingRes = await api.get(`/reviewRequest/average/driver/${bid.driver.driverId}`);
                            return { ...bid, driver: { ...bid.driver, averageRating: ratingRes.data.average } };
                        } catch {
                            return { ...bid, driver: { ...bid.driver, averageRating: null } };
                        }
                    })
                );

                setBids(updatedBids);
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar dados.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
    }, [transportId]);

    // Função toast
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Confirmar ação
    const confirmBidAction = (type, bidId) => {
        setConfirmAction({ type, bidId });
    };

    const executeAction = async (bidId, type) => {
        setProcessing(bidId);
        try {
            await api.post(`/bids/manual/${bidId}/${type}`);
            showToast(
                type === "accept"
                    ? " Licitação aceite com sucesso!"
                    : " Licitação rejeitada com sucesso!"
            );

            // Remove imediatamente a bid localmente (feedback instantâneo)
            setBids((prev) => prev.filter((b) => b.bidId !== bidId));

            // Depois atualiza a lista com dados reais do servidor
            await fetchBids();

        } catch (err) {
            console.error(err);
            showToast("Erro ao processar a ação.", "error");
        } finally {
            setProcessing(null);
            setConfirmAction(null);
        }
    };
    const fetchBids = async (signal) => {
        try {
            const bidsRes = await api.get(
                `/bids/bidsActive?transportRequestId=${transportId}`,
                { signal }
            );
            setBids(bidsRes.data);
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Erro ao buscar licitações:", err);
            }
        }
    };


    if (loading) return <p className="status-message">Carregando…</p>;
    if (error) return <p className="status-message error">Erro: {error}</p>;

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

    return (
        <div className="acceptbids-container">
            {transport && (
                <>
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
                                    <span className="detail-label">Dimensões:</span>{" "}
                                    {transport.length && transport.width && transport.height
                                        ? `${transport.length} x ${transport.width} x ${transport.height} cm`
                                        : "—"}
                                    {"  "}
                                    {transport.volume
                                        ? `(${transport.volume.toLocaleString("pt-PT")} cm³)`
                                        : ""}
                                </div>
                                <div>
                                    <span className="detail-label">Prazo de entrega:</span>{" "}
                                    {transport.deliveryDate
                                        ? new Date(transport.deliveryDate).toLocaleDateString()
                                        : "—"}
                                </div>
                                <div>
                                    <span className="detail-label">Prazo de recolha:</span>{" "}
                                    {transport.pickupDate
                                        ? new Date(transport.pickupDate).toLocaleDateString()
                                        : "—"}
                                </div>
                                <div>
                                    <span className="detail-label">Data do início do leilão:</span>{" "}
                                    {transport.biddingStartDate
                                        ? new Date(transport.biddingStartDate).toLocaleDateString()
                                        : "—"}
                                </div>
                                <div>
                                    <span className="detail-label">Fim do leilão:</span>{" "}
                                    <Countdown endDate={transport.biddingEndDate} />

                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )}

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
                                        Motorista: {bid.driver?.name || "—"}{" "}
                                        {bid.driver?.averageRating > 0 && (
                                            <span className="driver-rating">⭐ {bid.driver.averageRating.toFixed(1)}</span>
                                        )}
                                    </p>

                                    <p className="bid-value">
                                        Valor da Licitação: <span>{bid.value}€</span>
                                    </p>
                                    <p className="bid-deadline">
                                        Prazo de Entrega:{" "}
                                        {new Date(bid.deliveryDeadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bid-right">
                                    <div className="bid-buttons">
                                        <button
                                            className="accept-btn"
                                            onClick={() => confirmBidAction("accept", bid.bidId)}
                                            disabled={processing === bid.bidId}
                                        >
                                            {processing === bid.bidId &&
                                            confirmAction?.type === "accept"
                                                ? "Aceitando..."
                                                : "Aceitar"}
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => confirmBidAction("reject", bid.bidId)}
                                            disabled={processing === bid.bidId}
                                        >
                                            {processing === bid.bidId &&
                                            confirmAction?.type === "reject"
                                                ? "Rejeitando..."
                                                : "Rejeitar"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de confirmação */}
            {confirmAction && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <p>
                            Tens a certeza que queres{" "}
                            <strong>
                                {confirmAction.type === "accept" ? "ACEITAR" : "RECUSAR"}
                            </strong>{" "}
                            a licitação nº{confirmAction.bidId}?
                        </p>
                        <div className="confirm-buttons">
                            <button
                                className="confirm-yes"
                                onClick={() =>
                                    executeAction(confirmAction.bidId, confirmAction.type)
                                }
                            >
                                Sim
                            </button>
                            <button
                                className="confirm-no"
                                onClick={() => setConfirmAction(null)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>{toast.msg}</div>
            )}
        </div>
    );
}

export default AcceptBids;
