/**
 * @typedef {Object} BidCardProps
 * @property {Object} bid - Bid data to display.
 * @property {boolean} [showDriverInfo] - Whether to show driver information such as email and rating.
 * @property {function(Object)} [onEdit] - Callback to edit an existing bid.
 * @property {function(*): void} [onCancel] - Callback to cancel a bid, receiving the bid identifier.
 * @property {function(*): void} [onAccept] - Callback to accept a bid, receiving the bid identifier.
 * @property {function(*): void} [onReject] - Callback to reject a bid, receiving the bid identifier.
 * @property {boolean} [isOwnerDriver] - True if the current user owns this bid.
 * @property {boolean} [isCompany] - True if the current user represents a company.
 * @property {*} [processing] - Id of the bid currently being processed.
 * @property {Object|null} [confirmAction] - Optional object describing the active confirm action (e.g. type "accept" or "reject").
 */

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./BidCard.css";
import Button from "../Button/Button";

/**
 * Card component that displays the details and available actions for a single bid.
 *
 * It can show driver information, bid value and deadline, and exposes
 * edit/cancel actions for drivers and accept/reject actions for
 * companies, depending on the provided flags.
 *
 * @param {BidCardProps} props - Bid configuration and callbacks.
 * @returns {JSX.Element} Rendered bid card.
 */
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
