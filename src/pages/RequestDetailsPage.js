import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RequestDetails.css";
import { useParams, useNavigate } from "react-router";
import api from "../api/axiosConfig";
import { useMe } from "../hooks/useMe";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import EditBidModal from "../components/EditBidModal/EditBidModal";
import EditTransportModal from "../components/EditTransportModal/EditTransportModal";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import AddBidModal from "../components/AddBidModal/AddBidModal";
import Countdown from "../components/Countdown/Countdown";
import { getApiErrorMessage } from "../utils/httpError";
import StatusMessage from "../components/feedback/StatusMessage";
import { useToast } from "../components/feedback/ToastContext";
import BidList from "../components/domain/BidList";
import AcceptRejectOverlay from "../components/domain/AcceptRejectOverlay";
import TransportDetailsCard from "../components/domain/TransportDetailsCard";
import useSortedBids from "../hooks/useSortedBids";
import Button from "../components/Button/Button";

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

    const { showToast } = useToast();

    const [isEditTransportOpen, setIsEditTransportOpen] = useState(false);
    const [savingEditTransport, setSavingEditTransport] = useState(false);
    const [confirmCancelTransport, setConfirmCancelTransport] = useState(false);
    const [cancelingTransport, setCancelingTransport] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [confirmStatusAction, setConfirmStatusAction] = useState(null); // { target, label }

    // Toast agora fornecido globalmente pelo ToastProvider

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
    const sortedBids = useSortedBids(bids, sortBy, ascending);

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

    //RENDER guards
    if (meLoading) return <StatusMessage type="loading">Validating Session…</StatusMessage>;
    if (loading) return <StatusMessage type="loading">Loading…</StatusMessage>;
    if (error) return <StatusMessage type="error">Error: {error}</StatusMessage>;

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

                        <TransportDetailsCard
                            transport={transport}
                            actions={isCompany && (
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
                            showMaxPrice={true}
                            showAuction={true}
                        />
                    </>
                )}

                {/* BIDS SECTION */}
                {/* Draft/Canceled -> show nothing */}
                {(status === "DRAFT" || status === "CANCELED" || status === "CANCELLED") && null}

                {/* ACTIVE -> all active bids (drivers + company views preserved) */}
                {status === "ACTIVE" && (
                    <BidList
                        bids={sortedBids}
                        sortBy={sortBy}
                        ascending={ascending}
                        onChangeSort={setSortBy}
                        onToggleOrder={() => setAscending(!ascending)}
                        isDriver={isDriver}
                        isCompany={isCompany}
                        currentUserId={userId}
                        onAddBid={handleOpenAdd}
                        onEditBid={handleEditBid}
                        onAskCancelBid={handleAskCancelBid}
                        onConfirmAction={confirmBidAction}
                        processing={processing}
                        confirmAction={confirmAction}
                    />
                )}

                {/* ACCEPTED: WaitingPickup / Pendent / InTransit / Completed */}
                {(status !== "ACTIVE" &&
                    status !== "CANCELED" &&
                    status !== "DRAFT" &&
                    acceptedBid) && (

                    <div className="bid-card">
                        <div className="bid-info">
                            <h4 className="bid-title">Bid de {acceptedBid.driverName}</h4>

                            <p className="bid-driver">
                                <span className="detail-label">Email:</span>{" "}
                                {acceptedBid.driverEmail ?? "—"}
                            </p>

                            <p className="bid-value">
                                <span>Accepted Price:</span> <strong>{acceptedBid.value}€</strong>
                            </p>

                            <p className="bid-deadline">
                                <span className="detail-label">Deadline:</span>{" "}
                                {new Date(acceptedBid.deadline).toLocaleDateString()}
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

                            {isOwnerDriver(acceptedBid) && status === "WAITINGPICKUP" && (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        setConfirmStatusAction({
                                            target: "InTransit",
                                            label: "Iniciar Transporte",
                                        })
                                    }
                                    disabled={statusUpdating}
                                >
                                    {statusUpdating ? "Aguarde…" : "Iniciar Transporte"}
                                </Button>
                            )}

                            {isOwnerDriver(acceptedBid) && status === "INTRANSIT" && (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={() =>
                                            setConfirmStatusAction({
                                                target: "Completed",
                                                label: "Marcar como Concluído",
                                            })
                                        }
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating ? "Aguarde…" : "Concluir"}
                                    </Button>

                                    <Button
                                        variant="danger"
                                        onClick={() =>
                                            setConfirmStatusAction({
                                                target: "Canceled",
                                                label: "Cancelar Transporte",
                                            })
                                        }
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating ? "Aguarde…" : "Cancelar"}
                                    </Button>
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

            <AcceptRejectOverlay
                action={confirmAction}
                processing={processing}
                onConfirm={executeAction}
                onCancel={() => setConfirmAction(null)}
            />
            {/* Toasts agora são geridos globalmente (nenhum container local necessário) */}
        </>
    );
}

export default RequestDetailsPage;
