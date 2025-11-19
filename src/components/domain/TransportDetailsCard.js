import React from "react";
import Countdown from "../Countdown";

function TransportDetailsCard({
  transport,
  actions = null,
  showMaxPrice = true,
  showAuction = true,
  showDescription = true,
}) {
  if (!transport) return null;
  return (
    <div className="transport-card">
      <img
        src={transport.image || "https://via.placeholder.com/400x250"}
        alt={transport.package || "Item"}
        className="transport-image"
      />
      <div className="transport-details">
        {actions}
        <div className="details-grid">
          <div><span className="detail-label">Origem:</span> {transport.origin || "—"}</div>
          <div><span className="detail-label">Destino:</span> {transport.destination || "—"}</div>
          {showMaxPrice && (
            <div className="span-2"><span className="detail-label">Preço máximo:</span> {transport.maxPrice ? `${transport.maxPrice}€` : "—"}</div>
          )}
          <div><span className="detail-label">Peso:</span> {transport.weight ? `${transport.weight} kg` : "—"}</div>
          <div>
            <span className="detail-label">Dimensões:</span>{" "}
            {transport.length && transport.width && transport.height
              ? `${transport.length} × ${transport.width} × ${transport.height} cm`
              : "—"}
          </div>
          <div><span className="detail-label">Prazo entrega:</span> {transport.deliveryDate ? new Date(transport.deliveryDate).toLocaleDateString() : "—"}</div>
          <div><span className="detail-label">Prazo recolha:</span> {transport.pickupDate ? new Date(transport.pickupDate).toLocaleDateString() : "—"}</div>
          {showAuction && (
            <>
              <div><span className="detail-label">Início do leilão:</span> {transport.biddingStartDate ? new Date(transport.biddingStartDate).toLocaleDateString() : "—"}</div>
              <div><span className="detail-label">Fim do leilão:</span> <Countdown endDate={transport.biddingEndDate} /></div>
            </>
          )}
          {showDescription && transport.description && (
            <div className="span-2"><span className="detail-label">Descrição:</span> {transport.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransportDetailsCard;