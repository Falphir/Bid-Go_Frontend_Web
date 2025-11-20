import React, { useEffect, useRef } from "react";
import "./ConfirmDialog.css";
import Button from "../Button/Button";

export default function ConfirmDialog({
                                          open,
                                          title = "Confirm Action",
                                          message = "Are you sure?",
                                          confirmText = "Confirm",
                                          cancelText = "Cancel",
                                          loading = false,
                                          onConfirm,
                                          onCancel,
                                      }) {
    const dialogRef = useRef(null);
    const confirmBtnRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onCancel?.();
        window.addEventListener("keydown", onKey);
        confirmBtnRef.current?.focus();
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            className="cd-overlay"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="cd-modal"
                onClick={(e) => e.stopPropagation()}
                ref={dialogRef}
            >
                <h3 className="cd-title">{title}</h3>
                <p className="cd-message">{message}</p>

                <div className="cd-actions">

                    {/* Cancelar — cinzento (secondary) */}
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>

                    {/* Confirmar — vermelho (danger) */}
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={loading}
                        ref={confirmBtnRef}
                    >
                        {loading ? "A processar…" : confirmText}
                    </Button>

                </div>
            </div>
        </div>
    );
}
