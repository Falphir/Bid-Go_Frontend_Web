/**
 * @typedef {Object} AuctionDatesFieldsProps
 * @property {string} biddingStartDate - Current auction start date value (ISO date string).
 * @property {string} biddingEndDate - Current auction end date value (ISO date string).
 * @property {function(string, string): void} onChange - Callback to update a specific auction date field.
 */

import React from "react";
import "./AuctionDatesFields.css";


/**
 * Form fragment that renders inputs for auction start and end dates.
 *
 * @param {AuctionDatesFieldsProps} props - Values and change handler for auction dates.
 * @returns {JSX.Element} Rendered auction date fields row.
 */
export default function AuctionDatesFields({
  biddingStartDate,
  biddingEndDate,
  onChange,
}) {
  return (
    <div className="row">
      <div className="field">
        <label>Auction Start</label>
        <input
          type="date"
          value={biddingStartDate}
          onChange={(e) => onChange("biddingStartDate", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Auction End</label>
        <input
          type="date"
          value={biddingEndDate}
          onChange={(e) => onChange("biddingEndDate", e.target.value)}
        />
      </div>
    </div>
  );
}
