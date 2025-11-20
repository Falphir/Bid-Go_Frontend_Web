import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./BidCard.css";
import Button from "../Button/Button";

function BidCard({
                     bid,
                     showDriverInfo = true,
                     onEdit,
                     onCancel,
                     onAccept,
                     onReject,
                     isOwnerDriver,
                     isCompany,
                     processing,
                     confirmAction,
                 }) {
    return (
        <div className="bid-card">
            <div className="bid-info">
                <h4 className="bid-title">
                    Bid {bid.driver ? `from ${bid.driver.name}` : `#${bid.bidId}`}
                </h4>
                {showDriverInfo && (
                    <p className="bid-driver">
                        Driver Email: {bid.driver?.email || "—"}{" "}
                        {bid.driver?.averageRating > 0 && (
                            <span className="driver-rating">
                ⭐ {bid.driver.averageRating.toFixed(1)}
              </span>
                        )}
                    </p>
                )}
                <p className="bid-value">
                    Value: <span>{bid.value}€</span>
                </p>
                <p className="bid-deadline">
                    Deadline: {new Date(bid.deliveryDeadline).toLocaleDateString()}
                </p>
            </div>
            <div className="bid-right">
                {isOwnerDriver && (
                    <div className="bid-buttons">
                        {onEdit && (
                            <button
                                type="button"
                                className="edit-icon-btn"
                                onClick={() => onEdit(bid)}
                            >
                                <FontAwesomeIcon icon={faPencil} />
                            </button>
                        )}
                        {onCancel && (
                            <button
                                type="button"
                                className="cancel-icon-btn"
                                onClick={() => onCancel(bid.bidId)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                )}
                {isCompany && (onAccept || onReject) && (
                    <div className="bid-buttons">
                        {onAccept && (
                            <Button
                                variant="primary"
                                onClick={() => onAccept(bid.bidId)}
                                disabled={processing === bid.bidId}
                            >
                                {processing === bid.bidId && confirmAction?.type === "accept"
                                    ? "Accepting..."
                                    : "Accept"}
                            </Button>
                        )}

                        {onReject && (
                            <Button
                                variant="secondary"
                                onClick={() => onReject(bid.bidId)}
                                disabled={processing === bid.bidId}
                            >
                                {processing === bid.bidId && confirmAction?.type === "reject"
                                    ? "Rejecting..."
                                    : "Reject"}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BidCard;
