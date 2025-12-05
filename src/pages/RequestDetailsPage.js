import React, { useState } from "react";
import "../styles/RequestDetails.css";
import { useParams, useNavigate } from "react-router";
import { useMe } from "../hooks/useMe";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import EditBidModal from "../components/EditBidModal/EditBidModal";
import EditTransportModal from "../components/EditTransportModal/EditTransportModal";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import AddBidModal from "../components/AddBidModal/AddBidModal";
import { getApiErrorMessage } from "../utils/httpError";
import StatusMessage from "../components/feedback/StatusMessage";
import { useToast } from "../components/feedback/ToastContext";
import BidList from "../components/domain/BidList";
import AcceptRejectOverlay from "../components/domain/AcceptRejectOverlay";
import TransportDetailsCard from "../components/domain/TransportDetailsCard";
import useSortedBids from "../hooks/useSortedBids";
import Button from "../components/Button/Button";
import useRequestDetails from "../hooks/useRequestDetails";

/**
 * Request details page that displays a single transport request and
 * its related bids.
 *
 * Depending on the current user's role (driver or company), it allows
 * creating, editing and canceling bids, manually accepting/rejecting
 * bids and editing or publishing/canceling the transport itself.
 *
 * @returns {JSX.Element} Rendered request details page.
 */

function RequestDetailsPage() {
  const navigate = useNavigate();
  const { userId, isDriver, isCompany, loading: meLoading } = useMe();
  const { id } = useParams();
  const transportId = id;

  const [sortBy, setSortBy] = useState("value");
  const [ascending, setAscending] = useState(true);

  const [editingBid, setEditingBid] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmBidId, setConfirmBidId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing] = useState(null);

  const { showToast } = useToast();

  const [isEditTransportOpen, setIsEditTransportOpen] = useState(false);
  const [savingEditTransport, setSavingEditTransport] = useState(false);
  const [confirmCancelTransport, setConfirmCancelTransport] = useState(false);
  const [cancelingTransport, setCancelingTransport] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [confirmStatusAction, setConfirmStatusAction] = useState(null);

  const {
    transport,
    bids,
    acceptedBid,
    loading,
    error,
    refreshTransport,
    createBidForTransport,
    updateExistingBid,
    cancelExistingBid,
    manualAction,
    saveTransport,
    publishTransport: publishTransportAction,
    cancelExistingTransport,
    setStatus,
  } = useRequestDetails({ transportId });

  const sortedBids = useSortedBids(bids, sortBy, ascending);

  const isTransportDraft =
    !!transport &&
    ((transport?.status &&
      String(transport.status).toUpperCase() === "DRAFT") ||
      transport?.draft === true ||
      transport?.isDraft === true);

  const isTransportCanceled =
    !!transport &&
    ((transport?.status &&
      (String(transport.status).toUpperCase() === "CANCELED" ||
        String(transport.status).toUpperCase() === "CANCELLED")) ||
      transport?.canceled === true ||
      transport?.isCanceled === true);

  const isTransportOwner =
    !!transport && isCompany && transport?.companyId === userId;

  const isOwnerDriver = (bid) => {
    const bidDriverId = bid?.driverId;
    return isDriver && String(bidDriverId) === String(userId);
  };

  const now = new Date();
  const biddingStart = transport?.biddingStartDate
    ? new Date(transport.biddingStartDate)
    : null;
  const biddingEnd = transport?.biddingEndDate
    ? new Date(transport.biddingEndDate)
    : null;
  const auctionNotStarted = !!(
    biddingStart &&
    !isNaN(biddingStart) &&
    now < biddingStart
  );
  const auctionEnded = !!(biddingEnd && !isNaN(biddingEnd) && now > biddingEnd);

  const handleOpenAdd = () => {
    if (auctionNotStarted) {
      showToast("Auction hasn't started yet. You can't create bids.", "error");
      return;
    }
    if (auctionEnded) {
      showToast("Auction ended. You can't create new bids.", "error");
      return;
    }
    setAddOpen(true);
  };
  const handleCloseAdd = () => {
    if (!savingAdd) setAddOpen(false);
  };

  const handleSaveAdd = async (payload) => {
    try {
      if (auctionNotStarted) {
        showToast(
          "Auction hasn't started yet. You can't create bids.",
          "error"
        );
        return;
      }
      if (auctionEnded) {
        showToast("Auction ended. You can't create new bids.", "error");
        return;
      }
      setSavingAdd(true);
      await createBidForTransport(payload);
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
      await updateExistingBid(editingBid.bidId, payload);
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
      await cancelExistingBid(confirmBidId);
      showToast("Bid canceled successfully.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setCancelLoading(false);
      setConfirmBidId(null);
    }
  };

  const confirmBidAction = (type, bidId) => {
    setConfirmAction({ type, bidId });
  };

  const executeAction = async (bidId, type) => {
    setProcessing(bidId);
    try {
      await manualAction(bidId, type);
      showToast(
        type === "accept"
          ? "Bid accepted successfully!"
          : "Bid rejected successfully!",
        "success"
      );
      navigate(0);
    } catch (err) {
      console.error(err);
      showToast("Error processing action.", "error");
    } finally {
      setProcessing(null);
      setConfirmAction(null);
    }
  };

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
      await saveTransport(payload);
      showToast("Request updated successfully!", "success");
      setIsEditTransportOpen(false);
      await refreshTransport();
    } catch (err) {
      console.error("Error saving request edit:", err);
      const apiMsg = getApiErrorMessage(err);
      showToast(apiMsg || "Error updating request.", "error");
    } finally {
      setSavingEditTransport(false);
    }
  };

  const publishTransport = async () => {
    if (!transportId) return;
    setProcessing("publish");
    try {
      await publishTransportAction();
      showToast("Request published successfully!", "success");
      await refreshTransport();
    } catch (err) {
      const apiMsg = getApiErrorMessage(err);
      showToast(apiMsg || "Error publishing request.", "error");
    } finally {
      setProcessing(null);
    }
  };

  const updateTransportStatus = async (target) => {
    if (!transportId) return;
    setStatusUpdating(true);
    try {
      await setStatus(target);
      showToast("Request status updated successfully!", "success");
      await refreshTransport();
    } catch (err) {
      console.error("Error updating status:", err);
      const apiMsg = getApiErrorMessage(err);
      showToast(apiMsg || "Error updating request status.", "error");
    } finally {
      setStatusUpdating(false);
      setConfirmStatusAction(null);
    }
  };

  if (meLoading)
    return <StatusMessage type="loading">Validating Session…</StatusMessage>;
  if (loading) return <StatusMessage type="loading">Loading…</StatusMessage>;
  if (error) return <StatusMessage type="error">Error: {error}</StatusMessage>;

  // Company users that are not the request owner should not have access to actions
  if (isCompany && transport && !isTransportOwner) {
    return (
      <div className="acceptbids-container">
        <StatusMessage type="error">
          You don't have permission to view this request.
        </StatusMessage>
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

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
              actions={
                isCompany &&
                isTransportOwner && (
                  <div className="transport-actions">
                    {isTransportDraft && (
                      <>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={openEditTransport}
                        >
                          <FontAwesomeIcon icon={faPencil} />{" "}
                          <span style={{ marginLeft: 6 }}>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-publish"
                          onClick={publishTransport}
                          disabled={processing === "publish"}
                        >
                          <span>
                            {processing === "publish"
                              ? "Publishing…"
                              : "Publish"}
                          </span>
                        </button>
                      </>
                    )}
                    {!isTransportCanceled && (
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setConfirmCancelTransport(true)}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: 6,
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )
              }
              showMaxPrice={true}
              showAuction={true}
            />
          </>
        )}

        {(status === "DRAFT" ||
          status === "CANCELED" ||
          status === "CANCELLED") &&
          null}

        {status === "ACTIVE" && (
          <BidList
            bids={sortedBids}
            sortBy={sortBy}
            ascending={ascending}
            onChangeSort={setSortBy}
            onToggleOrder={() => setAscending(!ascending)}
            isDriver={isDriver}
            isCompany={isCompany && isTransportOwner}
            currentUserId={userId}
            onAddBid={handleOpenAdd}
            onEditBid={handleEditBid}
            onAskCancelBid={handleAskCancelBid}
            onConfirmAction={confirmBidAction}
            processing={processing}
            confirmAction={confirmAction}
            canAddBid={!auctionEnded && !auctionNotStarted}
            auctionNotStarted={auctionNotStarted}
            auctionEnded={auctionEnded}
          />
        )}

        {status !== "ACTIVE" &&
          status !== "CANCELED" &&
          status !== "DRAFT" &&
          acceptedBid && (
            <div className="bid-card">
              <div className="bid-info">
                <h4 className="bid-title">Bid from {acceptedBid.driverName}</h4>

                <p className="bid-driver">
                  <span className="detail-label">Email:</span>{" "}
                  {acceptedBid.driverEmail ?? "—"}
                </p>

                <p className="bid-value">
                  <span>Accepted Price:</span>{" "}
                  <strong>{acceptedBid.value}€</strong>
                </p>

                <p className="bid-deadline">
                  <span className="detail-label">Deadline:</span>{" "}
                  {new Date(acceptedBid.deadline).toLocaleDateString()}
                </p>
              </div>

              <div className="status-actions">
                {isCompany &&
                  (status === "PENDING" || status === "PENDENT") && (
                    <button
                      className="status-btn status-btn--primary"
                      onClick={() =>
                        setConfirmStatusAction({
                          target: "WaitingPickup",
                          label: "Mark as Waiting for Pickup",
                        })
                      }
                      disabled={statusUpdating}
                    >
                      {statusUpdating ? "Please wait…" : "Mark Pickup"}
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

      <EditTransportModal
        open={isEditTransportOpen}
        transport={transport}
        onClose={closeEditTransport}
        onSave={handleSaveTransport}
        saving={savingEditTransport}
      />

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
            await cancelExistingTransport();
            showToast("Request canceled successfully!", "success");
          } catch (err) {
            console.error("Error canceling request:", err);
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg || "Error canceling request.", "error");
          } finally {
            setCancelingTransport(false);
            setConfirmCancelTransport(false);
          }
        }}
        onCancel={() => setConfirmCancelTransport(false)}
      />

      <ConfirmDialog
        open={!!confirmStatusAction}
        title={confirmStatusAction?.label ?? "Confirm Action"}
        message={`Are you sure you want to ${
          confirmStatusAction?.label ?? "perform this action"
        }?`}
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
