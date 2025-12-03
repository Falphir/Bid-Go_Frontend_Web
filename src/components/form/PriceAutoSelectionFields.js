/**
 * @typedef {Object} PriceAutoSelectionFieldsProps
 * @property {string|number} maxPrice - Current maximum price value.
 * @property {boolean} isAutomaticSelectionEnabled - Whether the automatic algorithm is enabled.
 * @property {function(string, *): void} onChange - Callback to update price or toggle automatic selection.
 */

import React from "react";
import "./PriceAutoSelectionFields.css";


/**
 * Form fragment with inputs for maximum price and an automatic selection toggle.
 *
 * @param {PriceAutoSelectionFieldsProps} props - Price and automatic selection options.
 * @returns {JSX.Element} Rendered price and toggle controls.
 */
export default function PriceAutoSelectionFields({
  maxPrice,
  isAutomaticSelectionEnabled,
  onChange,
}) {
  return (
    <div className="row">
      <div className="field">
        <label>Maximum Price (€)</label>
        <input
          type="number"
          step="0.01"
          placeholder="e.g.: 150.00"
          value={maxPrice}
          onChange={(e) => onChange("maxPrice", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Automatic Algorithm</label>
        <div className="auto-algo">
          <label className="switch">
            <input
              type="checkbox"
              checked={isAutomaticSelectionEnabled}
              onChange={(e) =>
                onChange("isAutomaticSelectionEnabled", e.target.checked)
              }
            />
            <span className="slider" />
          </label>
        </div>
      </div>
    </div>
  );
}
