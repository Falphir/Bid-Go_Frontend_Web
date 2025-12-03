/**
 * @typedef {Object} PasswordChangeModalProps
 * @property {boolean} open - Whether the password change modal is visible.
 * @property {{ old: string, new: string, confirm: string }} passwords - Current values for the three password fields.
 * @property {function(string, string): void} onChangeField - Callback to update one of the password fields.
 * @property {function(): void} onClose - Callback invoked when the user closes the modal.
 * @property {function(): void} onSave - Callback invoked when the user confirms the password change.
 */

import React from "react";
import ReactDOM from "react-dom";
import PasswordInput from "../PasswordInput/PasswordInput";
import "./PasswordChangeModal.css";
import Button from "../Button/Button";


/**
 * Modal dialog that lets the user change their account password.
 *
 * @param {PasswordChangeModalProps} props - Modal state, current values and callbacks.
 * @returns {JSX.Element|null} Rendered modal portal or null when `open` is false.
 */
function PasswordChangeModal({
  open,
  passwords,
  onChangeField,
  onClose,
  onSave,
}) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <h3>Change Password</h3>

        <PasswordInput
          placeholder="Current password"
          value={passwords.old}
          onChange={(e) => onChangeField("old", e.target.value)}
        />

        <PasswordInput
          placeholder="New password"
          value={passwords.new}
          onChange={(e) => onChangeField("new", e.target.value)}
        />

        <PasswordInput
          placeholder="Confirm new password"
          value={passwords.confirm}
          onChange={(e) => onChangeField("confirm", e.target.value)}
        />

        <div className="modal-actions">
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>

          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PasswordChangeModal;
