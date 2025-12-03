/**
 * @typedef {Object} DriverRegisterFormValues
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} phone
 * @property {string} nif
 * @property {*} [driverLicense]
 * @property {*} [insurance]
 */

/**
 * @typedef {Object} DriverRegisterFormProps
 * @property {DriverRegisterFormValues} values - Current form field values.
 * @property {string|null} [error] - Error message shown below the form.
 * @property {boolean} [loading] - Indicates whether a submit request is in progress.
 * @property {function(string, *): void} onChange - Callback to update a specific field.
 * @property {function(): void} onSubmit - Callback invoked when the user confirms registration.
 * @property {function(): void} onCancel - Callback invoked when the user cancels.
 */

import React from "react";
import PasswordInput from "../PasswordInput/PasswordInput";
import Button from "../Button/Button";
import "./DriverRegisterForm.css";


/**
 * Registration form for driver accounts.
 *
 * It collects basic driver information (name, email, phone, tax id,
 * password) and images for driver license and insurance, delegating
 * state management and submission to the parent component.
 *
 * @param {DriverRegisterFormProps} props - Form configuration and handlers.
 * @returns {JSX.Element} Rendered driver registration form.
 */
function DriverRegisterForm({
  values,
  error,
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  const { name, email, password, phone, nif } = values;

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
        Driver’s License (image)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange("driverLicense", e.target.files[0])}
        />
      </label>

      <label className="login-label">
        Insurance (image)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange("insurance", e.target.files[0])}
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
        Tax ID
        <input
          placeholder="Tax ID"
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

export default DriverRegisterForm;
