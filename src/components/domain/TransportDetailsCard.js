/**
 * @typedef {Object} TransportDetailsCardProps
 * @property {Object} transport - Full transport object with details to display.
 * @property {JSX.Element|null} [actions] - Optional action buttons or controls rendered above the details.
 * @property {boolean} [showMaxPrice=true] - Whether to show the maximum price row.
 * @property {boolean} [showAuction=true] - Whether to show auction start/end information.
 * @property {boolean} [showDescription=true] - Whether to show the description field.
 */

import React from "react";
import Countdown from "../Countdown/Countdown";
import "./TransportDetailsCard.css";
import defaultTransportImage from "../../assets/Image-not-found.png";

/**
 * Detailed card component for a single transport request.
 *
 * It displays origin, destination, price, weight, dimensions, pickup
 * and delivery deadlines and optionally auction timing and description.
 *
 * @param {TransportDetailsCardProps} props - Card configuration and transport data.
 * @returns {JSX.Element|null} Rendered details card or null when no transport is provided.
 */
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
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultTransportImage;
                }}
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
