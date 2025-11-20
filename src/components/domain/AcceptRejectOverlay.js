import React from "react";
import "./AcceptRejectOverlay.css";

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
