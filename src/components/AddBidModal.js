import React, { useEffect, useState } from "react";
import "./AddBidModal.css";

export default function AddBidModal({ open, onClose, onSave, saving, transport }) {
    const [value, setValue] = useState("");
    const [deadline, setDeadline] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!open) return;
        setValue("");
        setNotes("");
        const today = new Date();
        const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);
        setDeadline(local);
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            transportRequestId: transport?.transportRequestId || transport?.id,
            value: Number(value),
            deliveryDeadline: deadline ? new Date(deadline).toISOString() : null,
            notes,
        });
    };

    return (
        <div className="abm-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="abm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="abm-title">New Bid</h3>
                {transport && (
                    <p className="abm-sub">
                        To <strong>{transport.package}</strong> — Destination: {transport.destination}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="abm-form">
                    <label className="abm-label">
                        Price (€)
                        <input
                            type="number"
                            min="0"
                            step="1.0"
                            className="abm-input"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            required
                        />
                    </label>

                    <label className="abm-label">
                        Deadline
                        <input
                            type="date"
                            className="abm-input"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />
                    </label>

                    <div className="abm-actions">
                        <button type="button" className="abm-btn abm-cancel" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="abm-btn abm-save" disabled={saving}>
                            {saving ? "Submitting…" : "Submit Bid"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
