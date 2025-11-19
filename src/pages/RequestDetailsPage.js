import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RequestDetails.css";
import { useParams, useNavigate } from "react-router";
import api from "../api/axiosConfig";
import { useMe } from "../hooks/useMe";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import EditBidModal from "../components/EditBidModal";
import EditTransportModal from "../components/EditTransportModal";
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
    const [bids, setBids] = useState([]); // Active bids or empty
    const [acceptedBid, setAcceptedBid] = useState(null); // For non-active states
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

    const [confirmAction, setConfirmAction] = useState(null); // { type, bidId }
    const [processing, setProcessing] = useState(null); // bidId or 'publish'

    const [toast, setToast] = useState(null);

    const [isEditTransportOpen, setIsEditTransportOpen] = useState(false);
    const [savingEditTransport, setSavingEditTransport] = useState(false);
    const [confirmCancelTransport, setConfirmCancelTransport] = useState(false);
    const [cancelingTransport, setCancelingTransport] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [confirmStatusAction, setConfirmStatusAction] = useState(null); // { target, label }

    // Helper toast
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ---------------------------
    // FETCH MAIN
    // ---------------------------
    useEffect(() => {
        if (!transportId) return;

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1) transport
                const transportRes = await api.get(`/transports/${transportId}`, {
                    signal: controller.signal,
                });
                const tr = transportRes.data;
                setTransport(tr);

                // Decide what to load based on transport status
                const status = String(tr?.status ?? "").toUpperCase();

                // If draft or canceled: no bids shown
                if (status === "DRAFT" || status === "CANCELED" || status === "CANCELLED") {
                    setBids([]);
                    setAcceptedBid(null);
                    return;
                }

                // If active: load active bids
                if (status === "ACTIVE") {
                    await loadActiveBids(controller.signal);
                    return;
                }

                // For WaitingPickup / Pendent / InTransit / Completed: load accepted bid
                // Accepting both "PENDENT" (your backend) and "PENDING" just in case
                if (
                    status === "WAITINGPICKUP" ||
                    status === "PENDENT" ||
                    status === "PENDING" ||
                    status === "INTRANSIT" ||
                    status === "COMPLETED"
                ) {
                    try {
                        const accRes = await api.get(`/bids/manual/byrequest/${transportId}/Accepted`);
                        // API may return array or object
                        const bid = Array.isArray(accRes.data) ? accRes.data[0] : accRes.data;
                        setAcceptedBid(bid || null);
                        setBids([]);
                    } catch (err) {
                        // If no accepted bid, backend might return 404; swallow and set null
                        if (err?.response?.status === 404) {
                            console.warn("No accepted bid found for transport", transportId);
                            setAcceptedBid(null);
                            setBids([]);
                        } else {
                            throw err;
                        }
                    }
                    return;
                }

                // Default: clear
                setBids([]);
                setAcceptedBid(null);
            } catch (err) {
                if (axios.isCancel(err)) return;
                console.error("Failed to load data:", err);
                setError("Failed to load Data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [transportId]);

    // sorted bids
    const sortedBids = [...bids].sort((a, b) => {
        if (sortBy === "value") {
            return ascending ? a.value - b.value : b.value - a.value;
        }
        if (sortBy === "deadline") {
            const da = new Date(a.deliveryDeadline);
            const db = new Date(b.deliveryDeadline);
            return ascending ? da - db : db - da;
        }
        return 0;
    });

    // Helpers from original code: transport draft/canceled detection
    const isTransportDraft = !!transport && (
        (transport?.status && String(transport.status).toUpperCase() === "DRAFT") ||
        transport?.draft === true ||
        transport?.isDraft === true
    );

    const isTransportCanceled = !!transport && (
        (transport?.status && (String(transport.status).toUpperCase() === "CANCELED" || String(transport.status).toUpperCase() === "CANCELLED")) ||
        transport?.canceled === true || transport?.isCanceled === true
    );

    const isTransportOwner = !!transport && isCompany && (
        transport?.companyId === userId 
    );

    const isOwnerDriver = (bid) => isDriver && ((bid?.driverId ?? bid?.driver?.driverId) === userId);

    // Refresh transport (used by publish/cancel)
    const refreshTransport = async () => {
        if (!transportId) return;
        try {
            const res = await api.get(`/transports/${transportId}`);
            setTransport(res.data);
        } catch (err) {
            console.error("Failed to refresh transport", err);
        }
    };

    // Load active bids (extracted for reuse after adding a bid)
    const loadActiveBids = async (signal) => {
        if (!transportId) return;
        try {
            const bidsRes = await api.get(
                `/bids/bidsActive?transportRequestId=${transportId}`,
                signal ? { signal } : undefined
            );

            const updatedBids = await Promise.all(
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

            setBids(updatedBids);
            setAcceptedBid(null);
        } catch (err) {
            if (err?.response?.status === 404) {
                console.warn("No active bids found — returning empty list.");
                setBids([]);
                setAcceptedBid(null);
            } else if (axios.isCancel(err)) {
                return;
            } else {
                throw err;
            }
        }
    };

    // ---------------------------
    // ACTIONS: Add / Edit / Cancel / Accept-Reject
    // ---------------------------
    const handleOpenAdd = () => setAddOpen(true);
    const handleCloseAdd = () => { if (!savingAdd) setAddOpen(false); };

    const handleSaveAdd = async (payload) => {
        try {
            setSavingAdd(true);
            await api.post(`/bids/createBid`, payload);
            // Reload full list to get fresh driver details & rating immediately
            await loadActiveBids();
            showToast("Bid created.", "success");
            setAddOpen(false);
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setSavingAdd(false);
        }
    };

    const handleEditBid = (bid) => setEditingBid(bid);
    const handleCloseEdit = () => { if (!savingEdit) setEditingBid(null); };

    const handleSaveEdit = async (payload) => {
        try {
            setSavingEdit(true);
            await api.put(`/bids/updatebid/${editingBid.bidId}`, payload);
            setBids((prev) => prev.map((b) => (b.bidId === editingBid.bidId ? { ...b, ...payload } : b)));
            showToast("Bid Updated.", "success");
            setEditingBid(null);
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleAskCancelBid = (bidId) => setConfirmBidId(bidId);

    const handleConfirmCancel = async () => {
        if (!confirmBidId) return;
        try {
            setCancelLoading(true);
            await api.patch(`/bids/cancel/${confirmBidId}`);
            setBids((prev) => prev.filter((b) => b.bidId !== confirmBidId));
            showToast("Bid was canceled Successfully", "success");
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setCancelLoading(false);
            setConfirmBidId(null);
        }
    };

    // Confirm overlay actions (accept/reject)
    const confirmBidAction = (type, bidId) => {
        setConfirmAction({ type, bidId });
    };

    const executeAction = async (bidId, type) => {
        setProcessing(bidId);
        try {
            await api.post(`/bids/manual/${bidId}/${type}`);
            showToast(type === "accept" ? "Licitação aceite com sucesso!" : "Licitação rejeitada com sucesso!", "success");
            // optimistic remove
            setBids((prev) => prev.filter((b) => b.bidId !== bidId));
            navigate(0);
        } catch (err) {
            console.error(err);
            showToast("Erro ao processar a ação.", "error");
        } finally {
            setProcessing(null);
            setConfirmAction(null);
        }
    };

    // Transport edit/save/publish handlers (copied from original)
    const openEditTransport = () => {
        if (!transport) return;
        setIsEditTransportOpen(true);
    };

    const closeEditTransport = () => {
        if (savingEditTransport) return;
        setIsEditTransportOpen(false);
    };

    const handleSaveTransport = async (payload) => {
        if (!transportId) return;
        setSavingEditTransport(true);
        try {
            try {
                try {
                    await api.post(`/transports/updateTransport/${transportId}`, payload);
                } catch (err) {
                    if (err?.response?.status === 405) {
                        await api.put(`/transports/updateTransport/${transportId}`, payload);
                    } else throw err;
                }
            } catch (err) {
                if (err?.response?.status === 415) {
                    // Retry as multipart/form-data
                    const formData = new FormData();
                    Object.keys(payload).forEach((k) => {
                        const v = payload[k];
                        if (v !== undefined && v !== null) formData.append(k, v);
                    });
                    try {
                        try {
                            await api.post(`/transports/updateTransport/${transportId}`, formData);
                        } catch (err2) {
                            if (err2?.response?.status === 405) {
                                await api.put(`/transports/updateTransport/${transportId}`, formData);
                            } else throw err2;
                        }
                    } catch (finalErr) {
                        throw finalErr;
                    }
                } else {
                    throw err;
                }
            }

            showToast('Pedido atualizado com sucesso!', 'success');
            setIsEditTransportOpen(false);
            await refreshTransport();
        } catch (err) {
            console.error('Erro ao salvar edição do pedido:', err);
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg || 'Erro ao atualizar o pedido.', 'error');
        } finally {
            setSavingEditTransport(false);
        }
    };

    const publishTransport = async () => {
        if (!transportId) return;
        setProcessing('publish');
        try {
            await api.put(`/transports/company/publish/${transportId}`);
            showToast('Pedido publicado com sucesso!', 'success');
            await refreshTransport();
        } catch (err) {
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg || 'Erro ao publicar o pedido.', 'error');
        } finally {
            setProcessing(null);
        }
    };

    // Update transport status via endpoint
    const updateTransportStatus = async (target) => {
        if (!transportId) return;
        setStatusUpdating(true);
        try {
            await api.put(`/transports/updateStatus/${transportId}`, { status: target });
            showToast('Estado do pedido atualizado com sucesso!', 'success');
            await refreshTransport();
        } catch (err) {
            console.error('Erro ao atualizar estado:', err);
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg || 'Erro ao atualizar estado do pedido.', 'error');
        } finally {
            setStatusUpdating(false);
            setConfirmStatusAction(null);
        }
    };

    // RENDER guards
    if (meLoading) return <p className="status-message">Validating Session…</p>;
    if (loading) return <p className="status-message">Loading…</p>;
    if (error) return <p className="status-message error">Error: {error}</p>;

    const status = String(transport?.status ?? "").toUpperCase();

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
                                {isCompany && (
                                    <div className="transport-actions">
                                        {isTransportDraft && (
                                            <>
                                                <button type="button" className="btn-edit" onClick={openEditTransport}>
                                                    <FontAwesomeIcon icon={faPencil} /> <span style={{ marginLeft: 6 }}>Editar</span>
                                                </button>
                                                <button type="button" className="btn-publish" onClick={publishTransport} disabled={processing === 'publish'}>
                                                    <span>{processing === 'publish' ? 'Publicando…' : 'Publicar'}</span>
                                                </button>
                                            </>
                                        )}

                                        {isTransportOwner && !isTransportCanceled && (
                                            <button type="button" className="btn-cancel" onClick={() => setConfirmCancelTransport(true)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6 }}>
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="details-grid">
                                    <div><span className="detail-label">Origem:</span> {transport.origin || "—"}</div>
                                    <div><span className="detail-label">Destino:</span> {transport.destination || "—"}</div>
                                    <div className="span-2">
                                        <span className="detail-label">Preço máximo:</span>{" "}
                                        {transport.maxPrice ? `${transport.maxPrice}€` : "—"}
                                    </div>
                                    <div><span className="detail-label">Peso:</span> {transport.weight ? `${transport.weight} kg` : "—"}</div>
                                    <div>
                                        <span className="detail-label">Dimensões:</span>{" "}
                                        {transport.length && transport.width && transport.height
                                            ? `${transport.length} × ${transport.width} × ${transport.height} cm`
                                            : "—"}
                                    </div>
                                    <div>
                                        <span className="detail-label">Prazo entrega:</span>{" "}
                                        {transport.deliveryDate ? new Date(transport.deliveryDate).toLocaleDateString() : "—"}
                                    </div>
                                    <div>
                                        <span className="detail-label">Prazo recolha:</span>{" "}
                                        {transport.pickupDate ? new Date(transport.pickupDate).toLocaleDateString() : "—"}
                                    </div>
                                    <div>
                                        <span className="detail-label">Início do leilão:</span>{" "}
                                        {transport.biddingStartDate ? new Date(transport.biddingStartDate).toLocaleDateString() : "—"}
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

                {/* BIDS SECTION */}
                {/* Draft/Canceled -> show nothing */}
                {(status === "DRAFT" || status === "CANCELED" || status === "CANCELLED") && null}

                {/* ACTIVE -> all active bids (drivers + company views preserved) */}
                {status === "ACTIVE" && (
                    <div className="bids-section">
                        <div className="bids-header">
                            <h3>Active Bids</h3>
                            <div className="sort-controls">
                                <label>Sort By:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                                    <option value="value">Price</option>
                                    <option value="deadline">Deadline</option>
                                </select>

                                <button type="button" onClick={() => setAscending(!ascending)} className="order-btn">
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

                        {/* LISTA DE BIDS */}
                        <div className="bids-list">
                            {sortedBids.length === 0 ? (
                                <p className="no-bids">No active bids found.</p>
                            ) : (
                                sortedBids.map((bid) => (
                                    <div className="bid-card" key={bid.bidId}>
                                        {/* left column */}
                                        <div className="bid-info">
                                            <h4 className="bid-title">Licitação de {bid.driver?.name || "—"}</h4>

                                            <p className="bid-driver">
                                                Email do Motorista: {bid.driver?.email || "—"}{" "}
                                                {bid.driver?.averageRating > 0 && (
                                                    <span className="driver-rating">⭐ {bid.driver.averageRating.toFixed(1)}</span>
                                                )}
                                            </p>

                                            <p className="bid-value">Bid Price: <span>{bid.value}€</span></p>

                                            <p className="bid-deadline">Deadline: {new Date(bid.deliveryDeadline).toLocaleDateString()}</p>
                                        </div>

                                        {/* right column: actions (driver/company) */}
                                        <div className="bid-right">
                                            {/* driver's own actions */}
                                            {isOwnerDriver(bid) && (
                                                <div className="bid-buttons">
                                                    <button type="button" className="edit-icon-btn" onClick={() => handleEditBid(bid)}>
                                                        <FontAwesomeIcon icon={faPencil} />
                                                    </button>
                                                    <button type="button" className="cancel-icon-btn" onClick={() => handleAskCancelBid(bid.bidId)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* company actions: accept/reject */}
                                            {isCompany && (
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
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ACCEPTED: WaitingPickup / Pendent / InTransit / Completed */}
                {(status !== "ACTIVE" &&
                    status !== "CANCELED" &&
                    status !== "DRAFT" &&
                    acceptedBid) && (

                    <div className="bid-card">
                        <div className="bid-info">
                            <h4 className="bid-title">Bid nº{acceptedBid.bidId}</h4>

                            <p className="bid-driver">
                                <span className="detail-label">Driver:</span>{" "}
                                {acceptedBid.driver?.name ?? "—"}
                            </p>

                            <p className="bid-value">
                                <span>Accepted Price:</span> <strong>{acceptedBid.value}€</strong>
                            </p>

                            <p className="bid-deadline">
                                <span className="detail-label">Deadline:</span>{" "}
                                {new Date(acceptedBid.deliveryDeadline).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="status-actions">
                            {/* Company: Pending -> WaitingPickup */}
                            {isCompany && (status === "PENDING" || status === "PENDENT") && (
                                <button
                                    className="status-btn status-btn--primary"
                                    onClick={() => setConfirmStatusAction({ target: 'WaitingPickup', label: 'Marcar como Aguardando Recolha' })}
                                    disabled={statusUpdating}
                                >
                                    {statusUpdating ? 'Aguarde…' : 'Marcar Recolha'}
                                </button>
                            )}

                            {/* Driver (only accepted bid owner): WaitingPickup -> InTransit */}
                            {isOwnerDriver(acceptedBid) && status === "WAITINGPICKUP" && (
                                <button
                                    className="status-btn status-btn--success"
                                    onClick={() => setConfirmStatusAction({ target: 'InTransit', label: 'Iniciar Transporte' })}
                                    disabled={statusUpdating}
                                >
                                    {statusUpdating ? 'Aguarde…' : 'Iniciar Transporte'}
                                </button>
                            )}

                            {/* Driver (only accepted bid owner): InTransit -> Completed or Canceled */}
                            {isOwnerDriver(acceptedBid) && status === "INTRANSIT" && (
                                <>
                                    <button
                                        className="status-btn status-btn--success"
                                        onClick={() => setConfirmStatusAction({ target: 'Completed', label: 'Marcar como Concluído' })}
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating ? 'Aguarde…' : 'Concluir'}
                                    </button>
                                    <button
                                        className="status-btn status-btn--danger"
                                        onClick={() => setConfirmStatusAction({ target: 'Canceled', label: 'Cancelar Transporte' })}
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating ? 'Aguarde…' : 'Cancelar'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                )}

            </div>

            {/* MODALS */}
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

            <EditTransportModal open={isEditTransportOpen} transport={transport} onClose={closeEditTransport} onSave={handleSaveTransport} saving={savingEditTransport} />

            <ConfirmDialog
                open={confirmCancelTransport}
                title="Cancelar Pedido"
                message="Tem a certeza que pretende cancelar este pedido de transporte?"
                confirmText="Sim, cancelar"
                cancelText="Não"
                loading={cancelingTransport}
                onConfirm={async () => {
                    setCancelingTransport(true);
                    try {
                        await api.put(`/transports/canceled/${transportId}`);
                        showToast('Pedido cancelado com sucesso!', 'success');
                        await refreshTransport();
                    } catch (err) {
                        console.error('Erro ao cancelar pedido:', err);
                        const apiMsg = getApiErrorMessage(err);
                        showToast(apiMsg || 'Erro ao cancelar o pedido.', 'error');
                    } finally {
                        setCancelingTransport(false);
                        setConfirmCancelTransport(false);
                    }
                }}
                onCancel={() => setConfirmCancelTransport(false)}
            />

            <ConfirmDialog
                open={!!confirmStatusAction}
                title={confirmStatusAction?.label ?? 'Confirmar Ação'}
                message={`Tem certeza que pretende ${confirmStatusAction?.label ?? 'executar esta ação'}?`}
                confirmText="Sim"
                cancelText="Cancelar"
                loading={statusUpdating}
                onConfirm={async () => {
                    if (!confirmStatusAction) return;
                    await updateTransportStatus(confirmStatusAction.target);
                }}
                onCancel={() => setConfirmStatusAction(null)}
            />

            {confirmAction && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <p>
                            Tens a certeza que queres <strong>{confirmAction.type === "accept" ? "ACEITAR" : "RECUSAR"}</strong> a licitação nº{confirmAction.bidId}?
                        </p>
                        <div className="confirm-buttons">
                            <button className="confirm-yes" onClick={() => executeAction(confirmAction.bidId, confirmAction.type)}>Sim</button>
                            <button className="confirm-no" onClick={() => setConfirmAction(null)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        </>
    );
}

export default RequestDetailsPage;
