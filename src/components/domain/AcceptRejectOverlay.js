/**
 * @typedef {Object} AcceptRejectAction
 * @property {"accept"|"reject"} type - Type of action to confirm.
 * @property {string|number} bidId - Identifier of the bid affected by the action.
 */

/**
 * @typedef {Object} AcceptRejectOverlayProps
 * @property {AcceptRejectAction|null} action - Current action being confirmed; null hides the overlay.
 * @property {function(*)} onConfirm -
 *   Callback invoked when the user confirms, receiving bid id and action type.
 * @property {function(): void} onCancel - Callback invoked when the user cancels.
 * @property {string|number} [processing] - Bid id currently being processed, used to disable buttons.
 */

import React from "react";
import "./AcceptRejectOverlay.css";

/**
 * Full-screen overlay asking the user to accept or reject a bid.
 *
 * It displays a short confirmation message and two buttons, one to
 * proceed with the action and another to cancel.
 *
 * @param {AcceptRejectOverlayProps} props - Overlay configuration and callbacks.
 * @returns {JSX.Element|null} Rendered overlay or null when `action` is null.
 */
function AcceptRejectOverlay({ action, onConfirm, onCancel, processing }) {
    if (!action) return null;
    const { type, bidId } = action;
    return (
        <div className="confirm-overlay">
            <div className="confirm-modal">
                <p>
                    Are you sure you want to{" "}
                    <strong>{type === "accept" ? "ACCEPT" : "REJECT"}</strong> bid nº{bidId}?
                </p>
                <div className="confirm-buttons">
                    <button
                        className="confirm-yes"
                        disabled={processing === bidId}
                        onClick={() => onConfirm(bidId, type)}
                    >
                        {processing === bidId ? "Processing…" : "Yes"}
                    </button>
                    <button className="confirm-no" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AcceptRejectOverlay;
