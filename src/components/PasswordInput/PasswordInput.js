/**
 * @typedef {Object} PasswordInputProps
 * @property {string} value - Current password value.
 * @property {function(Event): void} onChange - Change handler for the underlying input.
 * @property {string} [placeholder] - Placeholder text for the password field.
 * @property {string} [name] - Name attribute of the input.
 * @property {boolean} [required] - Whether the field is required.
 * @property {string} [autoComplete] - Auto-complete attribute value.
 * @property {string} [label] - Optional label rendered above the input.
 */

import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./PasswordInput.css";


/**
 * Password input with a show/hide toggle button.
 *
 * @param {PasswordInputProps} props - Password field configuration and handlers.
 * @returns {JSX.Element} Rendered password input component.
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  name,
  required = false,
  autoComplete = "off",
  label,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-input-wrapper">
      {label && <label className="password-label">{label}</label>}
      <div className="password-input-container">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          title={show ? "Hide password" : "Show password"}
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </div>
  );
}
