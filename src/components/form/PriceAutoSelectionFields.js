import React from "react";
import "./PriceAutoSelectionFields.css";

export default function PriceAutoSelectionFields({
  maxPrice,
  isAutomaticSelectionEnabled,
  onChange,
}) {
  return (
    <div className="row">
      <div className="field">
        <label>Preço Máximo (€)</label>
        <input
          type="number"
          step="0.01"
          placeholder="Ex.: 150.00"
          value={maxPrice}
          onChange={(e) => onChange("maxPrice", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Algoritmo Automático</label>
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
