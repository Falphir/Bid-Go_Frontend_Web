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
    const {role, userId, isDriver, isCompany, loading: meLoading} = useMe();
    const {id} = useParams();
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

    const {showToast} = useToast();

    const [isEditTransportOpen, setIsEditTransportOpen] = useState(false);
    const [savingEditTransport, setSavingEditTransport] = useState(false);
    const [confirmCancelTransport, setConfirmCancelTransport] = useState(false);
    const [cancelingTransport, setCancelingTransport] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [confirmStatusAction, setConfirmStatusAction] = useState(null); // { target, label }

    // Toast now provided globally by ToastProvider

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
                // Accepting both "PENDENT" (backend) and "PENDING"
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

    const isOwnerDriver = (bid) =>
        isDriver && ((bid?.driverId ?? bid?.driver?.driverId) === userId);

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
                signal ? {signal} : undefined
            );

            const updatedBids = await Promise.all(
                bidsRes.data.map(async (bid) => {
                    try {
                        const ratingRes = await api.get(
                            `/reviewRequest/average/driver/${bid.driver.driverId}`
                        );
                        return {...bid, driver: {...bid.driver, averageRating: ratingRes.data.average}};
                    } catch {
                        return {...bid, driver: {...bid.driver, averageRating: null}};
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
    const handleCloseAdd = () => {
        if (!savingAdd) setAddOpen(false);
    };

    const handleSaveAdd = async (payload) => {
        try {
            setSavingAdd(true);
            await api.post(`/bids/createBid`, payload);

            await loadActiveBids();
            showToast("Bid created successfully.", "success");
            setAddOpen(false);
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setSavingAdd(false);
        }
    };

    const handleEditBid = (bid) => setEditingBid(bid);
    const handleCloseEdit = () => {
        if (!savingEdit) setEditingBid(null);
    };

    const handleSaveEdit = async (payload) => {
        try {
            setSavingEdit(true);
            await api.put(`/bids/updatebid/${editingBid.bidId}`, payload);
            setBids((prev) =>
                prev.map((b) => (b.bidId === editingBid.bidId ? {...b, ...payload} : b))
            );
            showToast("Bid updated successfully.", "success");
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
            showToast("Bid canceled successfully.", "success");
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setCancelLoading(false);
            setConfirmBidId(null);
        }
    };

    // Confirm overlay actions (accept/reject)
    const confirmBidAction = (type, bidId) => {
        setConfirmAction({type, bidId});
    };

    const executeAction = async (bidId, type) => {
        setProcessing(bidId);
        try {
            await api.post(`/bids/manual/${bidId}/${type}`);
            showToast(
                type === "accept"
                    ? "Bid accepted successfully!"
                    : "Bid rejected successfully!",
                "success"
            );

            setBids((prev) => prev.filter((b) => b.bidId !== bidId));
            navigate(0);
        } catch (err) {
            console.error(err);
            showToast("Error processing action.", "error");
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

            showToast('Request updated successfully!', 'success');
            setIsEditTransportOpen(false);
            await refreshTransport();
        } catch (err) {
            console.error('Error saving request edit:', err);
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg || 'Error updating request.', 'error');
        } finally {
            setSavingEditTransport(false);
        }
    };

    const publishTransport = async () => {
        if (!transportId) return;
        setProcessing('publish');
        try {
            await api.put(`/transports/company/publish/${transportId}`);
            showToast('Request published successfully!', 'success');
            await refreshTransport();
        } catch (err) {
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg || 'Error publishing request.', 'error');
        } finally {
            setProcessing(null);
        }
    };

// Update transport status via endpoint
    const updateTransportStatus = async (target) => {
        if (!transportId) return;
        setStatusUpdating(true);
        try {
            await api.put(`/transports/updateStatus/${transportId}`, {status: target});
            showToast('Request status updated successfully!', 'success');
            await refreshTransport();
        } catch (err) {
            console.error('Error updating status:', err);
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg || 'Error updating request status.', 'error');
        } finally {
            setStatusUpdating(false);
            setConfirmStatusAction(null);
        }
    };

// RENDER guards
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
                                                <FontAwesomeIcon icon={faPencil}/> <span
                                                style={{marginLeft: 6}}>Edit</span>
                                            </button>
                                            <button type="button" className="btn-publish" onClick={publishTransport}
                                                    disabled={processing === 'publish'}>
                                                <span>{processing === 'publish' ? 'Publishing…' : 'Publish'}</span>
                                            </button>
                                        </>
                                    )}
                                    {isTransportOwner && !isTransportCanceled && (
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => setConfirmCancelTransport(true)}
                                            style={{
                                                background: '#ef4444',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: 6
                                            }}
                                        >
                                            Cancel
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

                {/* ACTIVE -> all active bids */}
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

                {/* ACCEPTED: WaitingPickup / Pending / InTransit / Completed */}
                {(status !== "ACTIVE" &&
                    status !== "CANCELED" &&
                    status !== "DRAFT" &&
                    acceptedBid) && (

                    <div className="bid-card">
                        <div className="bid-info">
                            <h4 className="bid-title">Bid from {acceptedBid.driverName}</h4>

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
                                    onClick={() => setConfirmStatusAction({
                                        target: 'WaitingPickup',
                                        label: 'Mark as Waiting for Pickup'
                                    })}
                                    disabled={statusUpdating}
                                >
                                    {statusUpdating ? 'Please wait…' : 'Mark Pickup'}
                                </button>
                            )}

                            {isOwnerDriver(acceptedBid) && status === "WAITINGPICKUP" && (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        setConfirmStatusAction({
                                            target: "InTransit",
                                            label: "Start Transport",
                                        })
                                    }
                                    disabled={statusUpdating}
                                >
                                    {statusUpdating ? "Please wait…" : "Start Transport"}
                                </Button>
                            )}

                            {isOwnerDriver(acceptedBid) && status === "INTRANSIT" && (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={() =>
                                            setConfirmStatusAction({
                                                target: "Completed",
                                                label: "Mark as Completed",
                                            })
                                        }
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating ? "Please wait…" : "Complete"}
                                    </Button>

                                    <Button
                                        variant="danger"
                                        onClick={() =>
                                            setConfirmStatusAction({
                                                target: "Canceled",
                                                label: "Cancel Transport",
                                            })
                                        }
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating ? "Please wait…" : "Cancel"}
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

            <EditTransportModal open={isEditTransportOpen} transport={transport} onClose={closeEditTransport}
                                onSave={handleSaveTransport} saving={savingEditTransport}/>

            <ConfirmDialog
                open={confirmCancelTransport}
                title="Cancel Request"
                message="Are you sure you want to cancel this transport request?"
                confirmText="Yes, Cancel"
                cancelText="No"
                loading={cancelingTransport}
                onConfirm={async () => {
                    setCancelingTransport(true);
                    try {
                        await api.put(`/transports/canceled/${transportId}`);
                        showToast('Request canceled successfully!', 'success');
                        await refreshTransport();
                    } catch (err) {
                        console.error('Error canceling request:', err);
                        const apiMsg = getApiErrorMessage(err);
                        showToast(apiMsg || 'Error canceling request.', 'error');
                    } finally {
                        setCancelingTransport(false);
                        setConfirmCancelTransport(false);
                    }
                }}
                onCancel={() => setConfirmCancelTransport(false)}
            />

            <ConfirmDialog
                open={!!confirmStatusAction}
                title={confirmStatusAction?.label ?? 'Confirm Action'}
                message={`Are you sure you want to ${confirmStatusAction?.label ?? 'perform this action'}?`}
                confirmText="Yes"
                cancelText="Cancel"
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
        </>
    );
}
export default RequestDetailsPage;
