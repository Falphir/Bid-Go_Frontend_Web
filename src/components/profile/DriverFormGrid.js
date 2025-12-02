import React from "react";
import "./DriverFormGrid.css";

// Form de dados de motorista (edição/leitura)
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
