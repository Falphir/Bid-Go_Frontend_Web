import React, { useEffect, useState } from "react";
import "./EditTransportModal.css";

export default function EditTransportModal({
                                               open,
                                               transport,
                                               onClose,
                                               onSave,
                                               saving,
                                           }) {
    const [form, setForm] = useState({});

    useEffect(() => {
        if (!open || !transport) return;
        setForm({
            origin: transport.origin ?? "",
            destination: transport.destination ?? "",
            package: transport.package ?? "",
            weight: transport.weight ?? "",
            length: transport.length ?? "",
            width: transport.width ?? "",
            height: transport.height ?? "",
            pickupDate: transport.pickupDate
                ? transport.pickupDate.split("T")[0]
                : "",
            deliveryDate: transport.deliveryDate
                ? transport.deliveryDate.split("T")[0]
                : "",
            maxPrice: transport.maxPrice ?? "",
            biddingStartDate: transport.biddingStartDate
                ? transport.biddingStartDate.split("T")[0]
                : "",
            biddingEndDate: transport.biddingEndDate
                ? transport.biddingEndDate.split("T")[0]
                : "",
            isAutomaticSelectionEnabled: !!transport.isAutomaticSelectionEnabled,
            imageFile: null,
        });
    }, [open, transport]);

    if (!open || !transport) return null;

    const handleChange = (field, value) =>
        setForm((p) => ({ ...p, [field]: value }));

    const handleFile = (e) => {
        const f = e.target.files && e.target.files[0];
        setForm((p) => ({ ...p, imageFile: f }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            origin: form.origin || null,
            destination: form.destination || null,
            package: form.package || null,
            weight: form.weight || null,
            length: form.length || null,
            width: form.width || null,
            height: form.height || null,
            pickupDate: form.pickupDate
                ? new Date(form.pickupDate).toISOString()
                : null,
            deliveryDate: form.deliveryDate
                ? new Date(form.deliveryDate).toISOString()
                : null,
            maxPrice: form.maxPrice || null,
            biddingStartDate: form.biddingStartDate
                ? new Date(form.biddingStartDate).toISOString()
                : null,
            biddingEndDate: form.biddingEndDate
                ? new Date(form.biddingEndDate).toISOString()
                : null,
            isAutomaticSelectionEnabled: !!form.isAutomaticSelectionEnabled,
            imageFile: form.imageFile || null,
        };
        onSave(payload);
    };

    return (
        <div
            className="etm-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="etm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="etm-title">
                    Edit Transport #
                    {transport.transportId || transport.id || transport._id}
                </h3>

                <form onSubmit={handleSubmit} className="etm-form">
                    <label className="etm-label">
                        Package
                        <input
                            className="etm-input"
                            value={form.package}
                            onChange={(e) => handleChange("package", e.target.value)}
                            required
                        />
                    </label>

                    <label className="etm-label">
                        Origin
                        <input
                            className="etm-input"
                            value={form.origin}
                            onChange={(e) => handleChange("origin", e.target.value)}
                        />
                    </label>

                    <label className="etm-label">
                        Destination
                        <input
                            className="etm-input"
                            value={form.destination}
                            onChange={(e) => handleChange("destination", e.target.value)}
                        />
                    </label>

                    <div className="etm-row">
                        <label className="etm-label">
                            Weight (kg)
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="etm-input"
                                value={form.weight}
                                onChange={(e) => handleChange("weight", e.target.value)}
                            />
                        </label>

                        <label className="etm-label">
                            Dimensions (L × W × H cm)
                            <div className="etm-dim-row">
                                <input
                                    type="number"
                                    className="etm-input"
                                    placeholder="L"
                                    value={form.length}
                                    onChange={(e) => handleChange("length", e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="etm-input"
                                    placeholder="W"
                                    value={form.width}
                                    onChange={(e) => handleChange("width", e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="etm-input"
                                    placeholder="H"
                                    value={form.height}
                                    onChange={(e) => handleChange("height", e.target.value)}
                                />
                            </div>
                        </label>
                    </div>

                    <label className="etm-label">
                        Pickup Date
                        <input
                            type="date"
                            className="etm-input"
                            value={form.pickupDate}
                            onChange={(e) => handleChange("pickupDate", e.target.value)}
                        />
                    </label>

                    <label className="etm-label">
                        Delivery Date
                        <input
                            type="date"
                            className="etm-input"
                            value={form.deliveryDate}
                            onChange={(e) => handleChange("deliveryDate", e.target.value)}
                        />
                    </label>

                    <label className="etm-label">
                        Max Price (€)
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="etm-input"
                            value={form.maxPrice}
                            onChange={(e) => handleChange("maxPrice", e.target.value)}
                        />
                    </label>

                    <label className="etm-label">
                        Bidding Start
                        <input
                            type="date"
                            className="etm-input"
                            value={form.biddingStartDate}
                            onChange={(e) => handleChange("biddingStartDate", e.target.value)}
                        />
                    </label>

                    <label className="etm-label">
                        Bidding End
                        <input
                            type="date"
                            className="etm-input"
                            value={form.biddingEndDate}
                            onChange={(e) => handleChange("biddingEndDate", e.target.value)}
                        />
                    </label>

                    <label className="etm-label">
                        Image (optional)
                        <input
                            type="file"
                            accept="image/*"
                            className="etm-input"
                            onChange={handleFile}
                        />
                    </label>

                    <label className="etm-label etm-toggle">
                        <input
                            type="checkbox"
                            checked={!!form.isAutomaticSelectionEnabled}
                            onChange={(e) =>
                                handleChange("isAutomaticSelectionEnabled", e.target.checked)
                            }
                        />{" "}
                        Automatic selection
                    </label>

                    <div className="etm-actions">
                        <button
                            type="button"
                            className="etm-btn etm-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="etm-btn etm-save"
                            disabled={saving}
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
