import React from "react";
import Countdown from "../../components/Countdown/Countdown";
import "./TransportCard.css";
import defaultTransportImage from "../../assets/Image-not-found.png";

/**
 * @typedef {Object} TransportCardProps
 * @property {Object} data - Normalized transport object to display.
 * @property {boolean} [isCompany] - True if the current user represents a company.
 * @property {boolean} [isDriver] - True if the current user represents a driver.
 * @property {function(*)} [onView] - Callback invoked when the user clicks to view details.
 */

/**
 * Summary card component for a transport request.
 *
 * It shows basic information such as package, route, origin/destination,
 * maximum price, current status and bidding countdown depending on the
 * user role.
 *
 * @param {TransportCardProps} props - Card configuration and transport data.
 * @returns {JSX.Element|null} Rendered card or null when no data is provided.
 */
export default function TransportCard({ data, isCompany, isDriver, onView }) {
    if (!data) return null;
    const {
        id,
        image,
        package: pkg,
        route,
        origin,
        destination,
        maxPrice,
        biddingEndDate,
        status,
    } = data;

    const statusText = (() => {
        if (status == null) return null;
        if (typeof status === "number") {
            switch (status) {
                case 0:
                    return "Active";
                case 1:
                    return "Canceled";
                case 2:
                    return "Completed";
                case 3:
                    return "Pending";
                case 4:
                    return "InTransit";
                case 5:
                    return "Draft";
                case 6:
                    return "WaitingPickup";
                default:
                    return String(status);
            }
        }
        if (typeof status === "boolean") return status ? "Canceled" : "Active";
        return String(status);
    })();

    const statusClass = statusText ? `status-${statusText.toLowerCase()}` : "";
    const endDate = biddingEndDate ? new Date(biddingEndDate) : null;

    return (
        <div className="card" key={id}>
            <div className="card-image">
                <img src={image || defaultTransportImage} alt={pkg} onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultTransportImage;
                }}/>
            </div>
            <div className="card-body">
                <div className="title-with-badge">
                    <h3 className="card-title">{pkg}</h3>
                    {statusText && (
                        <span className={`status-badge ${statusClass}`}>{statusText}</span>
                    )}
                </div>
                <p className="card-route">{route}</p>
                <div className="card-locations" title={`${origin} → ${destination}`}>
                    {origin} → {destination}
                </div>
                <div className="card-price">
                    <span className="label-small">Max Price:</span> {maxPrice}€
                </div>
                <p className="card-time">
                    {isCompany && statusText?.toLowerCase() === "active" ? (
                        <>
                            Remaining Time: {endDate ? <Countdown endDate={endDate} /> : "—"}
                        </>
                    ) : (
                        "\u00A0"
                    )}
                    {isDriver && (
                        <>
                            Bidding Ends:{" "}
                            {endDate ? <Countdown endDate={endDate} /> : "—"}
                        </>
                    )}
                </p>
                <button className="bid-btn" onClick={() => onView?.(id)}>
                    View Request
                </button>
            </div>
        </div>
    );
}
