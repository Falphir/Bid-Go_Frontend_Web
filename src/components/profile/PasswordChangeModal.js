import React from "react";
import ReactDOM from "react-dom";
import PasswordInput from "../PasswordInput";

function PasswordChangeModal({ open, passwords, onChangeField, onClose, onSave }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <h3>Alterar Palavra-passe</h3>
        <PasswordInput
          placeholder="Senha atual"
          value={passwords.old}
          onChange={(e) => onChangeField("old", e.target.value)}
        />
        <PasswordInput
          placeholder="Nova senha"
          value={passwords.new}
          onChange={(e) => onChangeField("new", e.target.value)}
        />
        <PasswordInput
          placeholder="Confirmar nova senha"
          value={passwords.confirm}
          onChange={(e) => onChangeField("confirm", e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onSave} className="btn primary">Guardar</button>
          <button
            className="btn danger"
            onClick={() => {
              onClose();
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PasswordChangeModal;
