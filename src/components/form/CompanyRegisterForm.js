import React from "react";
import PasswordInput from "../PasswordInput/PasswordInput";
import "./CompanyRegisterForm.css";
import Button from "../Button/Button";

// Form registo empresa
function CompanyRegisterForm({
  values,
  error,
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  const { name, companyName, address, email, password, phone, nif } = values;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label className="login-label">
        Name
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </label>

      <label className="login-label">
        Company Name
        <input
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => onChange("companyName", e.target.value)}
        />
      </label>

      <label className="login-label">
        Address
        <input
          placeholder="Address"
          value={address}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </label>

      <label className="login-label">
        Email
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </label>

      <PasswordInput
        label="Password"
        value={password}
        onChange={(e) => onChange("password", e.target.value)}
      />

      <label className="login-label">
        Phone
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </label>

      <label className="login-label">
        NIF
        <input
          placeholder="NIF"
          value={nif}
          onChange={(e) => onChange("nif", e.target.value)}
        />
      </label>

      {error && <p className="error-message">{error}</p>}

      <div className="form-actions">
        <Button variant="primary" onClick={onSubmit} disabled={loading}>
          {loading ? "Processing…" : "Register"}
        </Button>

        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default CompanyRegisterForm;
