/**
 * @typedef {Object} BidListProps
 * @property {Object[]} bids - List of active bids to display.
 * @property {string} sortBy - Current sort key (e.g. "value" or "deadline").
 * @property {boolean} ascending - Whether the current sort order is ascending.
 * @property {function(string)} onChangeSort - Callback to change the sort key.
 * @property {function()} onToggleOrder - Callback to toggle sort order.
 * @property {boolean} isDriver - True if the current user is a driver.
 * @property {boolean} isCompany - True if the current user is a company.
 * @property {(string|number)} currentUserId - Identifier of the current user.
 * @property {function()} onAddBid - Callback to open the add-bid modal.
 * @property {function(Object)} onEditBid - Callback to edit an existing bid.
 * @property {function((string|number))} onAskCancelBid - Callback to ask cancellation of a bid.
 * @property {function(string, (string|number))} onConfirmAction -
 *   Callback invoked when the user chooses to accept or reject a bid.
 * @property {(string|number)} [processing] - Id of the bid currently being processed.
 * @property {Object|null} [confirmAction] - Object describing the active confirm action.
 * @property {boolean} [canAddBid=true] - Whether the user is allowed to add bids.
 * @property {boolean} [auctionNotStarted=false] - True when auction hasn't started yet.
 * @property {boolean} [auctionEnded=false] - True when auction has already ended.
 */

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import BidCard from "./BidCard";
import "./BidList.css";

/**
 * List component that renders all active bids for a transport request.
 *
 * It supports sorting by value or deadline, toggling order, and offers
 * an action button for drivers to create new bids (when allowed).
 *
 * @param {BidListProps} props - List configuration, data and callbacks.
 * @returns {JSX.Element} Rendered bid list section.
 */
function BidList({
  bids,
  sortBy,
  ascending,
  onChangeSort,
  onToggleOrder,
  isDriver,
  isCompany,
  currentUserId,
  onAddBid,
  onEditBid,
  onAskCancelBid,
  onConfirmAction,
  processing,
  confirmAction,
  canAddBid = true,
  auctionNotStarted = false,
  auctionEnded = false,
}) {
  const btnStateClass = !canAddBid ? (auctionNotStarted ? "add-bid-btn--notstarted" : auctionEnded ? "add-bid-btn--ended" : "") : "";
  const btnTitle = !canAddBid ? (auctionNotStarted ? "Auction hasn't started yet." : auctionEnded ? "Auction ended." : undefined) : undefined;

  return (
    <div className="bids-section">
      <div className="bids-header">
        <h3>Active Bids</h3>
        <div className="sort-controls">
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => onChangeSort(e.target.value)}
            className="sort-select"
          >
            <option value="value">Price</option>
            <option value="deadline">Deadline</option>
          </select>
          <button type="button" onClick={onToggleOrder} className="order-btn">
            {ascending ? "⬆" : "⬇"}
          </button>
          {isDriver && (
            <button
              type="button"
              className={`add-bid-btn ${btnStateClass}`}
              onClick={onAddBid}
              title={btnTitle}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>New Bid</span>
            </button>
          )}
        </div>
      </div>
      <div className="bids-list">
        {bids.length === 0 ? (
          <p className="no-bids">No active bids found.</p>
        ) : (
          bids.map((bid) => (

            <BidCard
              key={bid.bidId}
              bid={bid}
              isOwnerDriver={
                isDriver && String(bid?.driverId ?? bid?.driver?.driverId) === String(currentUserId)
              }
              isCompany={isCompany}
              onEdit={onEditBid}
              onCancel={onAskCancelBid}
              onAccept={(bidId) => onConfirmAction("accept", bidId)}
              onReject={(bidId) => onConfirmAction("reject", bidId)}
              processing={processing}
              confirmAction={confirmAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default BidList;
