import React from "react";
import "./PriceAutoSelectionFields.css";

// Campos preço + seleção automática
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
