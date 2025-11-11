import React, { useEffect, useState } from "react";
import "./EditBidModal.css";

export default function EditBidModal({ open, bid, onClose, onSave, saving }) {
    const [value, setValue] = useState("");
    const [deadline, setDeadline] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!open || !bid) return;
        setValue(bid.value ?? "");
        const d = bid.deliveryDeadline ? new Date(bid.deliveryDeadline) : null;
        setDeadline(
            d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ""
        );
        setNotes(bid.notes ?? "");
    }, [open, bid]);

    if (!open || !bid) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            value: Number(value),
            deliveryDeadline: deadline ? new Date(deadline).toISOString() : null,
            notes,
        });
    };

    return (
        <div className="ebm-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="ebm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="ebm-title">Editing Bid #{bid.bidId}</h3>

                <form onSubmit={handleSubmit} className="ebm-form">
                    <label className="ebm-label">
                        Price (€)
                        <input
                            type="number"
                            min="0"
                            step="1.00"
                            className="ebm-input"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            required
                        />
                    </label>

                    <label className="ebm-label">
                        Deadline
                        <input
                            type="date"
                            className="ebm-input"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />
                    </label>

                    <div className="ebm-actions">
                        <button type="button" className="ebm-btn ebm-cancel" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="ebm-btn ebm-save" disabled={saving}>
                            {saving ? "Updating…" : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
