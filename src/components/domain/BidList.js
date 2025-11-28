import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import BidCard from "./BidCard";
import "./BidList.css";

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
  canAddBid = true, // New optional prop (default true) to disable add when auction closed
}) {
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
              className={`add-bid-btn ${!canAddBid ? "add-bid-btn--ended" : ""}`}
              onClick={onAddBid}
              title={canAddBid ? undefined : "Auction ended."}
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
                isDriver && (bid?.driver?.driverId) === currentUserId
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
