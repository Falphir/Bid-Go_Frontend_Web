import React from "react";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./DeactivateAccountModal.css";

// Wrapper de confirmação para desativar conta
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
