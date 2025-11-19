import React from "react";
import "./AcceptRejectOverlay.css";

function AcceptRejectOverlay({ action, onConfirm, onCancel, processing }) {
  if (!action) return null;
  const { type, bidId } = action;
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <p>
          Tens a certeza que queres{" "}
          <strong>{type === "accept" ? "ACEITAR" : "RECUSAR"}</strong> a
          licitação nº{bidId}?
        </p>
        <div className="confirm-buttons">
          <button
            className="confirm-yes"
            disabled={processing === bidId}
            onClick={() => onConfirm(bidId, type)}
          >
            {processing === bidId ? "A processar…" : "Sim"}
          </button>
          <button className="confirm-no" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AcceptRejectOverlay;
