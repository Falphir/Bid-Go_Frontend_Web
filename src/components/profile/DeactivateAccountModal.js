import React from "react";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./DeactivateAccountModal.css";

function DeactivateAccountModal({ open, loading, onConfirm, onCancel }) {
  return (
    <ConfirmDialog
      open={open}
      title="Desativar Conta"
      message="Tem a certeza que deseja desativar a sua conta? Esta ação é reversível apenas por suporte."
      confirmText="Confirmar"
      cancelText="Cancelar"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default DeactivateAccountModal;
