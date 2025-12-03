/**
 * @typedef {Object} DateFieldsProps
 * @property {string} pickupDate - Current pickup date value (ISO date string).
 * @property {string} deliveryDate - Current delivery date value (ISO date string).
 * @property {function(string, string): void} onChange - Callback to update a specific date field.
 */

import React from "react";
import "./DateFields.css";


/**
 * Small form fragment that renders pickup and delivery date inputs.
 *
 * @param {DateFieldsProps} props - Values and change handler for the date fields.
 * @returns {JSX.Element} Rendered date fields row.
 */
export default function DateFields({ pickupDate, deliveryDate, onChange }) {
  return (
    <div className="row">
      <div className="field">
        <label>Pickup Date</label>
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => onChange("pickupDate", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Delivery Date</label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => onChange("deliveryDate", e.target.value)}
        />
      </div>
    </div>
  );
}
