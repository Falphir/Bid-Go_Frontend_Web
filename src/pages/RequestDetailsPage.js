import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RequestDetails.css";
import { useParams, useNavigate  } from "react-router";
import api from "../api/axiosConfig";
import {useMe} from "../hooks/useMe";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import EditBidModal from "../components/EditBidModal";
import ConfirmDialog from "../components/ConfirmDialog";
import AddBidModal from "../components/AddBidModal";
import Countdown from "../components/Countdown";
import { getApiErrorMessage } from "../utils/httpError";

function RequestDetailsPage() {
    const navigate = useNavigate();
    const { role, userId, isDriver, isCompany, loading: meLoading } = useMe();
    const { id } = useParams();
    const transportId = id;
    const [transport, setTransport] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("value");
    const [ascending, setAscending] = useState(true);
    const [editingBid, setEditingBid] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [confirmBidId, setConfirmBidId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [savingAdd, setSavingAdd] = useState(false);

    const [confirmAction, setConfirmAction] = useState(null); // {type, bidId}
    const [processing, setProcessing] = useState(null); // bidId que está em ação
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!transportId) {
            setError(`Transport Request with ID ${transportId} not found.`);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const transportRes = await api.get(`/transports/${transportId}`, {
                    signal: controller.signal,
                });
                setTransport(transportRes.data);

                const bidsRes = await api.get(
                    `/bids/bidsActive?transportRequestId=${transportId}`,
                    { signal: controller.signal }
                );

                const updatedBids = await Promise.all(
                    bidsRes.data.map(async (bid) => {
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
                if (axios.isCancel(err)) return;
                setError("Failed to load Data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [transportId]);

    if (meLoading) return <p className="status-message">Validating Session…</p>;
    if (loading) return <p className="status-message">Loading…</p>;
    if (error) return <p className="status-message error">Error: {error}</p>;

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

    const isOwnerDriver = (bid) =>
        isDriver && ((bid?.driverId ?? bid?.driver?.driverId) === userId);

    const handleOpenAdd = () => setAddOpen(true);
    const handleCloseAdd = () => { if (!savingAdd) setAddOpen(false); };

    const handleSaveAdd = async (payload) => {
        try {
            setSavingAdd(true);
            const res = await api.post(`/bids/createBid`, payload);
            const created = res.data || {
                bidId: Math.random().toString(36).slice(2),
                driver: { name: "Tu", driverId: userId },
                ...payload,
            };

            setBids((prev) => [created, ...prev]);
            setToast({ type: "success", msg: "Bid created." });
            setAddOpen(false);
        } catch(err) {
            setToast({ type: "error", msg: getApiErrorMessage(err) });
        } finally {
            setSavingAdd(false);
            setTimeout(() => setToast(null), 2500);
        }
    };

    const handleEditBid = (bid) => setEditingBid(bid);
    const handleCloseEdit = () => { if (!savingEdit) setEditingBid(null); };

    const handleSaveEdit = async (payload) => {
        try {
            setSavingEdit(true);
            await api.put(`/bids/updatebid/${editingBid.bidId}`, payload);

            setBids((prev) =>
                prev.map((b) => (b.bidId === editingBid.bidId ? { ...b, ...payload } : b))
            );

            setToast({ type: "success", msg: "Bid Updated." });
            setEditingBid(null);
        } catch(err) {
            setToast({ type: "error", msg: getApiErrorMessage(err) });
        } finally {
            setSavingEdit(false);
            setTimeout(() => setToast(null), 2500);
        }
    };

    const handleAskCancelBid = (bidId) => setConfirmBidId(bidId);

    const handleConfirmCancel = async () => {
        if (!confirmBidId) return;
        try {
            setCancelLoading(true);
            await api.patch(`/bids/cancel/${confirmBidId}`);

            // update otimista
            setBids((prev) => prev.filter((b) => b.bidId !== confirmBidId));
            setToast({ type: "success", msg: "Bid was canceled Successfully" });
        } catch (err) {
            setToast({ type: "error", msg: getApiErrorMessage(err) });
        } finally {
            setCancelLoading(false);
            setConfirmBidId(null);
            setTimeout(() => setToast(null), 2500);
        }
    };

    // Função para confirmar ação de aceitar/rejeitar licitação
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

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
            navigate(0);

        } catch (err) {
            console.error(err);
            showToast("Erro ao processar a ação.", "error");
        } finally {
            setProcessing(null);
            setConfirmAction(null);
            setTimeout(() => setToast(null), 2500);
        }
    };


    return (
        <>
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
                        <h3>Active Bids</h3>
                        <div className="sort-controls">
                            <label>Sort By:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-select"
                            >
                                <option value="value">Price</option>
                                <option value="deadline">Deadline</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => setAscending(!ascending)}
                                className="order-btn"
                            >
                                {ascending ? "⬆" : "⬇"}
                            </button>
                            {isDriver && (
                                <button type="button" className="add-bid-btn" onClick={handleOpenAdd}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    <span>New Bid</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {isDriver && (
                    <div className="bids-list">
                        {sortedBids.length === 0 ? (
                            <p className="no-bids">No Bid was found.</p>
                        ) : (
                            sortedBids.map((bid) => (
                                <div className="bid-card" key={bid.bidId}>
                                    {/* ESQUERDA: info da bid */}
                                    <div className="bid-info">
                                        <h4 className="bid-title">Bid nº{bid.bidId}</h4>

                                        <p className="bid-driver">
                                            Driver: {bid.driver?.name || "—"}{" "}
                                            {bid.driver?.averageRating > 0 && (
                                                <span className="driver-rating">
        ⭐ {bid.driver.averageRating.toFixed(1)}
      </span>
                                            )}
                                        </p>

                                        <p className="bid-value">
                                            Bid Price: <span>{bid.value}€</span>
                                        </p>

                                        <p className="bid-deadline">
                                            Deadline:{" "}
                                            {new Date(bid.deliveryDeadline).toLocaleDateString()}
                                        </p>
                                    </div>


                                    {/* DIREITA: botões */}
                                    <div className="bid-right">
                                        <div className="bid-actions">

                                            {/* botões de ação */}
                                            {isOwnerDriver(bid) && (
                                            <div className="bid-buttons">
                                                <button
                                                    type="button"
                                                    className="edit-icon-btn"
                                                    onClick={() => handleEditBid(bid)}
                                                    aria-label="Edit Bid"
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon className="edit-icon" icon={faPencil}/>
                                                </button>


                                                <button
                                                    type="button"
                                                    className="cancel-icon-btn"
                                                    onClick={() => handleAskCancelBid(bid.bidId)}
                                                    aria-label="Cancel Bid"
                                                    title="Cancel"
                                                >
                                                    <FontAwesomeIcon className="cancel-icon" icon={faTrash}/>
                                                </button>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    )}
                    {isCompany && (
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
                                                    <span
                                                        className="driver-rating">⭐ {bid.driver.averageRating.toFixed(1)}</span>
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
                    )}
                </div>
            </div>
            <AddBidModal
                open={addOpen}
                onClose={handleCloseAdd}
                onSave={handleSaveAdd}
                saving={savingAdd}
                transport={transport}
                maxPrice={transport?.maxPrice}
                pickupDate={transport?.pickupDate}
                deliveryDate={transport?.deliveryDate}
            />
            <EditBidModal
                open={!!editingBid}
                bid={editingBid}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
                saving={savingEdit}
                maxPrice={transport?.maxPrice}
                pickupDate={transport?.pickupDate}
                deliveryDate={transport?.deliveryDate}
            />
            <ConfirmDialog
                open={!!confirmBidId}
                title="Cancel Bid"
                message="Do you really want to cancel this bid?"
                confirmText="Yes, Cancel"
                cancelText="No"
                loading={cancelLoading}
                onConfirm={handleConfirmCancel}
                onCancel={() => setConfirmBidId(null)}
            />

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

            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        </>
    );
}

export default RequestDetailsPage;
