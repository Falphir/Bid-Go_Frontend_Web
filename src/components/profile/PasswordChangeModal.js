import React from "react";
import ReactDOM from "react-dom";
import PasswordInput from "../PasswordInput/PasswordInput";
import "./PasswordChangeModal.css";
import Button from "../Button/Button";

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
