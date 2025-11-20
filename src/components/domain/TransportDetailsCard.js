import React from "react";
import Countdown from "../Countdown/Countdown";
import "./TransportDetailsCard.css";

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
                    <div>
                        <span className="detail-label">Origin:</span>{" "}
                        {transport.origin || "—"}
                    </div>
                    <div>
                        <span className="detail-label">Destination:</span>{" "}
                        {transport.destination || "—"}
                    </div>
                    {showMaxPrice && (
                        <div className="span-2">
                            <span className="detail-label">Maximum Price:</span>{" "}
                            {transport.maxPrice ? `${transport.maxPrice}€` : "—"}
                        </div>
                    )}
                    <div>
                        <span className="detail-label">Weight:</span>{" "}
                        {transport.weight ? `${transport.weight} kg` : "—"}
                    </div>
                    <div>
                        <span className="detail-label">Dimensions:</span>{" "}
                        {transport.length && transport.width && transport.height
                            ? `${transport.length} × ${transport.width} × ${transport.height} cm`
                            : "—"}
                    </div>
                    <div>
                        <span className="detail-label">Delivery Deadline:</span>{" "}
                        {transport.deliveryDate
                            ? new Date(transport.deliveryDate).toLocaleDateString()
                            : "—"}
                    </div>
                    <div>
                        <span className="detail-label">Pickup Deadline:</span>{" "}
                        {transport.pickupDate
                            ? new Date(transport.pickupDate).toLocaleDateString()
                            : "—"}
                    </div>
                    {showAuction && (
                        <>
                            <div>
                                <span className="detail-label">Auction Start:</span>{" "}
                                {transport.biddingStartDate
                                    ? new Date(transport.biddingStartDate).toLocaleDateString()
                                    : "—"}
                            </div>
                            <div>
                                <span className="detail-label">Auction End:</span>{" "}
                                <Countdown endDate={transport.biddingEndDate} />
                            </div>
                        </>
                    )}
                    {showDescription && transport.description && (
                        <div className="span-2">
                            <span className="detail-label">Description:</span>{" "}
                            {transport.description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TransportDetailsCard;
