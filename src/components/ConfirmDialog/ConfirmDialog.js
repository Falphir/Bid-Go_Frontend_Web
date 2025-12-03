/**
 * @typedef {Object} ConfirmDialogProps
 * @property {boolean} open - Whether the dialog is visible.
 * @property {string} [title] - Dialog title displayed at the top.
 * @property {string} [message] - Body message asking for confirmation.
 * @property {string} [confirmText] - Label for the confirm button.
 * @property {string} [cancelText] - Label for the cancel button.
 * @property {boolean} [loading] - Indicates if a confirm action is in progress.
 * @property {function(): void} [onConfirm] - Callback invoked when the user confirms.
 * @property {function(): void} [onCancel] - Callback invoked when the user cancels or closes the dialog.
 */

import React, { useEffect, useRef } from "react";
import "./ConfirmDialog.css";
import Button from "../Button/Button";

/**
 * Accessible confirmation modal dialog.
 *
 * It traps accidental clicks outside as cancel, listens to the `Escape`
 * key to dismiss and focuses the confirm button when opened.
 *
 * @param {ConfirmDialogProps} props - Dialog configuration and callbacks.
 * @returns {JSX.Element|null} Rendered dialog or null when `open` is false.
 */
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
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>

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
