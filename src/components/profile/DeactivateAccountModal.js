/**
 * @typedef {Object} DeactivateAccountModalProps
 * @property {boolean} open - Whether the confirmation modal is visible.
 * @property {boolean} loading - Indicates whether the deactivation request is in progress.
 * @property {function(): void} onConfirm - Callback invoked when the user confirms deactivation.
 * @property {function(): void} onCancel - Callback invoked when the user cancels.
 */

import React from "react";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./DeactivateAccountModal.css";


/**
 * Wrapper component around {@link ConfirmDialog} for account deactivation.
 *
 * @param {DeactivateAccountModalProps} props - Dialog visibility and callbacks.
 * @returns {JSX.Element} Rendered deactivate account dialog.
 */
function DeactivateAccountModal({ open, loading, onConfirm, onCancel }) {
  return (
    <ConfirmDialog
      open={open}
      title="Deactivate Account"
      message="Are you sure you want to deactivate your account? This action can only be reversed by support."
      confirmText="Confirm"
      cancelText="Cancel"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default DeactivateAccountModal;
