/**
 * @typedef {Object} CompanyFormGridProps
 * @property {Object|null} profile - Company profile object used to fill the form.
 * @property {boolean} editing - Whether the form is in editing mode.
 * @property {function(string, string): void} onChange - Callback to update a specific profile field.
 */

import React from "react";
import "./CompanyFormGrid.css";


/**
 * Grid layout form for viewing and editing company profile data.
 *
 * @param {CompanyFormGridProps} props - Profile data and change handler.
 * @returns {JSX.Element} Rendered company profile grid.
 */
function CompanyFormGrid({ profile, editing, onChange }) {
  return (
    <div className={`form-grid company-layout ${!editing ? "readonly" : ""}`}>
      <label className="form-label span-1">
        Name
        <input
          className="Name"
          type="text"
          disabled={!editing}
          value={profile?.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </label>

      <label className="form-label span-1">
        Company Name
        <input
          type="text"
          disabled={!editing}
          value={profile?.companyName || ""}
          onChange={(e) => onChange("companyName", e.target.value)}
        />
      </label>

      <label className="form-label span-2">
        Email
        <input
          type="email"
          disabled={!editing}
          value={profile?.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </label>

      <label className="form-label span-2">
        Address
        <input
          type="text"
          disabled={!editing}
          value={profile?.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </label>

      <label className="form-label span-2">
        Phone
        <input
          type="text"
          disabled={!editing}
          value={profile?.phoneNumber || ""}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
        />
      </label>

      <label className="form-label span-2">
        Tax ID (NIF)
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

export default CompanyFormGrid;
