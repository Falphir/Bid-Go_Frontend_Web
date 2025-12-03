/**
 * @typedef {Object} DimensionFieldsProps
 * @property {string} length - Current length value.
 * @property {string} width - Current width value.
 * @property {string} height - Current height value.
 * @property {string} [volume] - Calculated volume string (e.g. "1000 cm³").
 * @property {function(string, string): void} onChange - Callback to update a specific dimension field.
 */

import React from "react";
import "./DimensionFields.css";


/**
 * Form fragment that renders inputs for length, width and height and
 * optionally shows the calculated volume.
 *
 * @param {DimensionFieldsProps} props - Dimension values and update handler.
 * @returns {JSX.Element} Rendered dimension fields block.
 */
export default function DimensionFields({
  length,
  width,
  height,
  volume,
  onChange,
}) {
  const handle = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="field">
      <div className="dimensions-header">
        <label>Dimensions (cm)</label>
        <div className="volume-inline">{volume ? `${volume} cm³` : ""}</div>
      </div>

      <div className="dimensions-group">
        <input
          className="dimensions-input"
          type="text"
          placeholder="Length"
          value={length}
          onChange={(e) => handle("length", e.target.value)}
          aria-label="Length (cm)"
        />
        <span className="dimensions-sep">/</span>

        <input
          className="dimensions-input"
          type="text"
          placeholder="Width"
          value={width}
          onChange={(e) => handle("width", e.target.value)}
          aria-label="Width (cm)"
        />
        <span className="dimensions-sep">/</span>

        <input
          className="dimensions-input"
          type="text"
          placeholder="Height"
          value={height}
          onChange={(e) => handle("height", e.target.value)}
          aria-label="Height (cm)"
        />
      </div>

      <input type="hidden" value={`${length}/${width}/${height}`} readOnly />
    </div>
  );
}
