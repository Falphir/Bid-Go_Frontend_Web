/**
 * @typedef {Object} DriverFormGridProps
 * @property {Object|null} profile - Driver profile object used to fill the form.
 * @property {boolean} editing - Whether the form is in editing mode.
 * @property {function(string, string): void} onChange - Callback to update a specific profile field.
 */

import React from "react";
import "./DriverFormGrid.css";


/**
 * Grid layout form for viewing and editing driver profile data.
 *
 * @param {DriverFormGridProps} props - Profile data and change handler.
 * @returns {JSX.Element} Rendered driver profile grid.
 */
function DriverFormGrid({ profile, editing, onChange }) {
  return (
    <div className={`form-grid one-col ${!editing ? "readonly" : ""}`}>
      <label className="form-label">
        Name
        <input
          type="text"
          disabled={!editing}
          value={profile?.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </label>

      <label className="form-label">
        Email
        <input
          type="email"
          disabled={!editing}
          value={profile?.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </label>

      <label className="form-label">
        Phone
        <input
          type="text"
          disabled={!editing}
          value={profile?.phoneNumber || ""}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
        />
      </label>

      <label className="form-label">
        Tax ID
        <input
          type="text"
          disabled={!editing}
          value={profile?.nif || ""}
          onChange={(e) => onChange("nif", e.target.value)}
        />
      </label>
    </div>
  );
}

export default DriverFormGrid;
