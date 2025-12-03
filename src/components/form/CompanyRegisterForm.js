/**
 * @typedef {Object} CompanyRegisterFormValues
 * @property {string} name
 * @property {string} companyName
 * @property {string} address
 * @property {string} email
 * @property {string} password
 * @property {string} phone
 * @property {string} nif
 */

/**
 * @typedef {Object} CompanyRegisterFormProps
 * @property {CompanyRegisterFormValues} values - Current form field values.
 * @property {string|null} [error] - Error message to display below the form.
 * @property {boolean} [loading] - Indicates whether a submit request is in progress.
 * @property {function(string, *): void} onChange - Callback to update a specific field.
 * @property {function(): void} onSubmit - Callback invoked when the user confirms registration.
 * @property {function(): void} onCancel - Callback invoked when the user cancels.
 */

import React from "react";
import PasswordInput from "../PasswordInput/PasswordInput";
import "./CompanyRegisterForm.css";
import Button from "../Button/Button";


/**
 * Registration form for company accounts.
 *
 * It collects basic company information (name, address, email, phone,
 * NIF, password) and delegates state management and submit handling to
 * the parent component via callbacks.
 *
 * @param {CompanyRegisterFormProps} props - Form configuration and state handlers.
 * @returns {JSX.Element} Rendered company registration form.
 */
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
