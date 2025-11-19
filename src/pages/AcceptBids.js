// Página para aceitar ou rejeitar licitações de um pedido de transporte
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import api from "../api/axiosConfig";
import "../styles/RequestDetails.css";
import StatusMessage from "../components/feedback/StatusMessage";
import { useToast } from "../components/feedback/ToastContext";
import TransportDetailsCard from "../components/domain/TransportDetailsCard";
import useSortedBids from "../hooks/useSortedBids";
import AcceptRejectOverlay from "../components/domain/AcceptRejectOverlay";

function AcceptBids() {
    const { id } = useParams();
    const navigate = useNavigate();
    const transportId = id;

    const [transport, setTransport] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("value");
    const [ascending, setAscending] = useState(true);
    const [confirmAction, setConfirmAction] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (!transportId) return;
        const controller = new AbortController();
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const trRes = await api.get(`/transports/${transportId}`, { signal: controller.signal });
                const tr = trRes.data;
                setTransport(tr);
                if (String(tr?.status ?? "").toUpperCase() === "ACTIVE") {
                    await fetchBids(controller.signal);
                } else {
                    setBids([]);
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
                console.error("Falha ao carregar dados", err);
                setError("Falha ao carregar dados.");
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [transportId]);

    const fetchBids = async (signal) => {
        try {
            const res = await api.get(`/bids/bidsActive?transportRequestId=${transportId}`, { signal });
            const enriched = await Promise.all(
                res.data.map(async (bid) => {
                    try {
                        const ratingRes = await api.get(`/reviewRequest/average/driver/${bid.driver.driverId}`);
                        return { ...bid, driver: { ...bid.driver, averageRating: ratingRes.data.average } };
                    } catch {
                        return { ...bid, driver: { ...bid.driver, averageRating: null } };
                    }
                })
            );
            setBids(enriched);
        } catch (err) {
            if (!axios.isCancel(err)) console.error("Erro a obter licitações", err);
        }
    };

    const isTransportCanceled = () => {
        return !!transport && String(transport.status ?? "").toUpperCase().includes("CANCEL");
    };

    const confirmBidAction = (type, bidId) => setConfirmAction({ type, bidId });

    const executeAction = async () => {
        if (!confirmAction) return;
        const { type, bidId } = confirmAction;
        setProcessing(bidId);
        try {
            if (type === "accept") {
                await api.put(`/bids/acceptBid/${bidId}`);
                showToast("Licitação aceite!", "success");
                navigate(-1);
            } else {
                await api.put(`/bids/rejectBid/${bidId}`);
                showToast("Licitação rejeitada.", "success");
                await fetchBids();
            }
        } catch (err) {
            console.error(err);
            showToast("Erro ao processar.", "error");
        } finally {
            setProcessing(null);
            setConfirmAction(null);
        }
    };

    const cancelTransport = async () => {
        if (!transportId) return;
        setProcessing("cancel");
        try {
            await api.put(`/transports/canceled/${transportId}`);
            showToast("Pedido cancelado.", "success");
            navigate(-1);
        } catch (err) {
            console.error(err);
            showToast("Erro ao cancelar.", "error");
        } finally {
            setProcessing(null);
            setConfirmCancel(false);
        }
    };

    if (loading) return <StatusMessage type="loading">Carregando…</StatusMessage>;
    if (error) return <StatusMessage type="error">Erro: {error}</StatusMessage>;

    const sortedBids = useSortedBids(bids, sortBy, ascending);

    return (
        <div className="acceptbids-container">
            {transport && (
                <>
                    <div className="title-row">
                        <h2 className="page-title">
                            {transport.package}{transport.description ? ` (${transport.description})` : ""}
                        </h2>
                        <div className="title-actions">
                            {isTransportCanceled() ? (
                                <span className="canceled-badge">Pedido Cancelado</span>
                            ) : (
                                <button
                                    className="cancel-request-btn"
                                    onClick={() => setConfirmCancel(true)}
                                    disabled={processing === "cancel"}
                                >
                                    {processing === "cancel" ? "Cancelando..." : "Cancelar Pedido"}
                                </button>
                            )}
                        </div>
                    </div>
                    <TransportDetailsCard transport={transport} />
                </>
            )}
            <div className="bids-section">
                <div className="bids-header">
                    <h3>Licitações ativas</h3>
                    <div className="sort-controls">
                        <label>Ordenar por:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                            <option value="value">Valor</option>
                            <option value="deadline">Prazo</option>
                        </select>
                        <button type="button" onClick={() => setAscending(!ascending)} className="order-btn">
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
                                    <p className="bid-value">Valor: <span>{bid.value}€</span></p>
                                    <p className="bid-deadline">Prazo: {new Date(bid.deliveryDeadline).toLocaleDateString()}</p>
                                </div>
                                <div className="bid-right">
                                    <div className="bid-buttons">
                                        <button
                                            className="accept-btn"
                                            onClick={() => confirmBidAction("accept", bid.bidId)}
                                            disabled={processing === bid.bidId}
                                        >
                                            {processing === bid.bidId && confirmAction?.type === "accept" ? "Aceitando..." : "Aceitar"}
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => confirmBidAction("reject", bid.bidId)}
                                            disabled={processing === bid.bidId}
                                        >
                                            {processing === bid.bidId && confirmAction?.type === "reject" ? "Rejeitando..." : "Rejeitar"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <AcceptRejectOverlay action={confirmAction} processing={processing} onConfirm={executeAction} onCancel={() => setConfirmAction(null)} />
            {confirmCancel && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <p>Tens a certeza que queres <strong>CANCELAR</strong> este pedido?</p>
                        <div className="confirm-buttons">
                            <button className="confirm-yes" onClick={cancelTransport} disabled={processing === "cancel"}>Sim</button>
                            <button className="confirm-no" onClick={() => setConfirmCancel(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AcceptBids;
/* Duplicate old implementation below commented out to remove redeclarations
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import api from "../api/axiosConfig";
import "../styles/RequestDetails.css";
import StatusMessage from "../components/feedback/StatusMessage";
import { useToast } from "../components/feedback/ToastContext";
import TransportDetailsCard from "../components/domain/TransportDetailsCard";
import useSortedBids from "../hooks/useSortedBids";
import AcceptRejectOverlay from "../components/domain/AcceptRejectOverlay";

function AcceptBids() {
    const { id } = useParams();
    const navigate = useNavigate();
    const transportId = id;

    const [transport, setTransport] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("value");
    const [ascending, setAscending] = useState(true);
    const [confirmAction, setConfirmAction] = useState(null); // { type, bidId }
    const [processing, setProcessing] = useState(null); // bidId or 'cancel'
    const [confirmCancel, setConfirmCancel] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        if (!transportId) return;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const transportRes = await api.get(`/transports/${transportId}`, {
                    signal: controller.signal,
                });
                const tr = transportRes.data;
                setTransport(tr);

                const status = String(tr?.status ?? "").toUpperCase();
                if (status === "ACTIVE") {
                    await fetchBids(controller.signal);
                } else {
                    setBids([]);
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
                console.error("Erro ao carregar dados:", err);
                setError("Falha ao carregar dados.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [transportId]);

    const fetchBids = async (signal) => {
        try {
            const bidsRes = await api.get(
                `/bids/bidsActive?transportRequestId=${transportId}`,
                { signal }
            );
            const enriched = await Promise.all(
                bidsRes.data.map(async (bid) => {
                    try {
                        const ratingRes = await api.get(
                            `/reviewRequest/average/driver/${bid.driver.driverId}`
                        );
                        return { ...bid, driver: { ...bid.driver, averageRating: ratingRes.data.average } };
                    } catch {
                        return { ...bid, driver: { ...bid.driver, averageRating: null } };
                    }
                })
            );
            setBids(enriched);
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Erro ao buscar licitações:", err);
            }
        }
    };

    const isTransportCanceled = () => {
        if (!transport) return false;
        const s = transport.status ?? "";
        return String(s).toUpperCase().includes("CANCEL");
    };

    const confirmBidAction = (type, bidId) => {
        setConfirmAction({ type, bidId });
    };

    const executeAction = async () => {
        if (!confirmAction) return;
        const { type, bidId } = confirmAction;
        setProcessing(bidId);
        try {
            if (type === "accept") {
                await api.put(`/bids/acceptBid/${bidId}`);
                showToast("Licitação aceite com sucesso!", "success");
                navigate(-1);
            } else if (type === "reject") {
                await api.put(`/bids/rejectBid/${bidId}`);
                showToast("Licitação rejeitada.", "success");
                await fetchBids();
            }
        } catch (err) {
            console.error(err);
            showToast("Erro ao processar a ação.", "error");
        } finally {
            setProcessing(null);
            setConfirmAction(null);
        }
    };

    const cancelTransport = async () => {
        if (!transportId) return;
        setProcessing("cancel");
        try {
            await api.put(`/transports/canceled/${transportId}`);
            showToast("✅ Pedido cancelado com sucesso!", "success");
            navigate(-1);
        } catch (err) {
            console.error("Erro ao cancelar pedido:", err);
            showToast("Erro ao cancelar o pedido.", "error");
        } finally {
            setProcessing(null);
            setConfirmCancel(false);
        }
    };

    if (loading) return <StatusMessage type="loading">Carregando…</StatusMessage>;
    if (error) return <StatusMessage type="error">Erro: {error}</StatusMessage>;

    const sortedBids = useSortedBids(bids, sortBy, ascending);

    return (
        <div className="acceptbids-container">
            {transport && (
                <>
                    <div className="title-row">
                        <h2 className="page-title">
                            {transport.package}
                            {transport.description ? ` (${transport.description})` : ""}
                        </h2>
                        <div className="title-actions">
                            {isTransportCanceled() ? (
                                <span className="canceled-badge">Pedido Cancelado</span>
                            ) : (
                                <button
                                    className="cancel-request-btn"
                                    onClick={() => setConfirmCancel(true)}
                                    disabled={processing === "cancel"}
                                >
                                    {processing === "cancel" ? "Cancelando..." : "Cancelar Pedido"}
                                </button>
                            )}
                        </div>
                    </div>
                    <TransportDetailsCard transport={transport} />
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
                                            {processing === bid.bidId && confirmAction?.type === "accept"
                                                ? "Aceitando..."
                                                : "Aceitar"}
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => confirmBidAction("reject", bid.bidId)}
                                            disabled={processing === bid.bidId}
                                        >
                                            {processing === bid.bidId && confirmAction?.type === "reject"
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

            <AcceptRejectOverlay
                action={confirmAction}
                processing={processing}
                onConfirm={executeAction}
                onCancel={() => setConfirmAction(null)}
            />

            {confirmCancel && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <p>
                            Tens a certeza que queres <strong>CANCELAR</strong> este pedido de transporte?
                        </p>
                        <div className="confirm-buttons">
                            <button
                                className="confirm-yes"
                                onClick={cancelTransport}
                                disabled={processing === "cancel"}
                            >
                                Sim
                            </button>
                            <button
                                className="confirm-no"
                                onClick={() => setConfirmCancel(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AcceptBids;import React, { useEffect, useState } from "react";
import StatusMessage from "../components/feedback/StatusMessage";
import { useToast } from "../components/feedback/ToastContext";
import axios from "axios";
import "../styles/RequestDetails.css";
import { useParams, useNavigate } from "react-router";
import api from "../api/axiosConfig";
import Countdown from "../components/Countdown"; // kept for potential legacy usage
import TransportDetailsCard from "../components/domain/TransportDetailsCard";
import useSortedBids from "../hooks/useSortedBids";
import BidList from "../components/domain/BidList";
import AcceptRejectOverlay from "../components/domain/AcceptRejectOverlay";


function AcceptBids() {
    const { id } = useParams();
    const transportId = id;
    const [transport, setTransport] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("value");
    const [ascending, setAscending] = useState(true);

            <BidList
                bids={sortedBids}
                sortBy={sortBy}
                ascending={ascending}
                onChangeSort={setSortBy}
                onToggleOrder={() => setAscending(!ascending)}
                isDriver={false}
                isCompany={true}
                onEditBid={null}
                onAskCancelBid={null}
                onConfirmAction={confirmBidAction}
                processing={processing}
                confirmAction={confirmAction}
            />
            console.error(err);
            showToast("Erro ao processar a ação.", "error");
        } finally {
            setProcessing(null);
            setConfirmAction(null);
        }
    };

    const cancelTransport = async () => {
        if (!transportId) return;
        setProcessing('cancel');
        try {
            await api.put(`/transports/canceled/${transportId}`);
            showToast('✅ Pedido cancelado com sucesso!'); 
            navigate(-1);
        } catch (err) {
            console.error('Erro ao cancelar pedido:', err);
            showToast('Erro ao cancelar o pedido.', 'error');
        } finally {
            setProcessing(null);
            setConfirmCancel(false);
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

    const isTransportCanceled = () => {
        if (!transport) return false;
        const s =
            transport.status ??
            "";
        if (typeof s === "string") return s.toLowerCase().includes("cancel");
        if (typeof s === "boolean") return !!s;
        if (typeof s === "number") return s === 1; 
        return false;
    };


    if (loading) return <StatusMessage type="loading">Carregando…</StatusMessage>;
    if (error) return <StatusMessage type="error">Erro: {error}</StatusMessage>;

    const sortedBids = useSortedBids(bids, sortBy, ascending);

    return (
        <div className="acceptbids-container">
            {transport && (
                <>
                    <div className="title-row">
                        <h2 className="page-title">
                            {transport.package}
                            {transport.description ? ` (${transport.description})` : ""}
                        </h2>
                        <div className="title-actions">
                            {isTransportCanceled() ? (
                                <span className="canceled-badge">Pedido Cancelado</span>
                            ) : (
                                <button
                                    className="cancel-request-btn"
                                    onClick={() => setConfirmCancel(true)}
                                    disabled={processing === 'cancel'}
                                >
                                    {processing === 'cancel' ? 'Cancelando...' : 'Cancelar Pedido'}
                                </button>
                            )}
                        </div>
                    </div>

                    <TransportDetailsCard transport={transport} />
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
            <AcceptRejectOverlay
                action={confirmAction}
                processing={processing}
                onConfirm={executeAction}
                onCancel={() => setConfirmAction(null)}
            />

            {/* Modal de confirmação para cancelar o pedido */}
            {confirmCancel && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <p>
                            Tens a certeza que queres <strong>CANCELAR</strong> este pedido de transporte?
                        </p>
                        <div className="confirm-buttons">
                            <button
                                className="confirm-yes"
                                onClick={() => cancelTransport()}
                                disabled={processing === 'cancel'}
                            >
                                Sim
                            </button>
                            <button
                                className="confirm-no"
                                onClick={() => setConfirmCancel(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast removido - agora global via ToastProvider */}
        </div>
    );
}

export default AcceptBids; */
