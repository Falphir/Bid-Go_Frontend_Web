import React, { useEffect, useMemo, useState } from "react";
import "./EditBidModal.css";
import Button from "../Button/Button";

// Modal para editar bid
export default function EditBidModal({
  open,
  bid,
  onClose,
  onSave,
  saving,
  maxPrice,
  pickupDate,
  deliveryDate,
}) {
  const [value, setValue] = useState("");
  const [deadline, setDeadline] = useState("");

  const [errors, setErrors] = useState({ value: "", deadline: "" });

  const toLocalYMD = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };

  const minDeadlineISO = useMemo(() => {
    if (!pickupDate) return "";
    const dt = new Date(pickupDate);
    if (Number.isNaN(dt.getTime())) return "";
    dt.setDate(dt.getDate() + 1);
    return toLocalYMD(dt);
  }, [pickupDate]);
  const maxDeadlineISO = useMemo(
    () => toLocalYMD(deliveryDate),
    [deliveryDate]
  );

  useEffect(() => {
    if (!open || !bid) return;
    setValue(bid.value ?? "");
    const d = bid.deliveryDeadline ? new Date(bid.deliveryDeadline) : null;
    setDeadline(
      d
        ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10)
        : ""
    );
  }, [open, bid]);

  if (!open || !bid) return null;

  const validateValue = (vStr) => {
    if (vStr === "" || vStr === null) return "Price is required.";
    const num = Number(vStr);
    if (!isFinite(num)) return "Price must be a number.";
    if (num < 0) return "Price must be equal or greater than 0.";
    if (!/^\d+(\.\d{1,2})?$/.test(String(vStr))) return "Max 2 decimal places.";
    if (maxPrice != null && num > Number(maxPrice)) {
      return `Price cannot exceed ${Number(maxPrice).toFixed(2)}€.`;
    }
    return "";
  };

  const validateDeadline = (dateStr) => {
    if (!dateStr) return "Deadline is required.";
    if (minDeadlineISO && dateStr < minDeadlineISO) {
      return `Deadline cannot be before pickup date (${minDeadlineISO}).`;
    }
    if (maxDeadlineISO && dateStr > maxDeadlineISO) {
      return `Deadline cannot be after delivery date (${maxDeadlineISO}).`;
    }
    return "";
  };

  const hasErrors = !!(errors.value || errors.deadline);

  const handleValueChange = (e) => {
    const v = e.target.value;
    setValue(v);
    setErrors((prev) => ({ ...prev, value: validateValue(v) }));
  };

  const handleDeadlineChange = (e) => {
    const d = e.target.value;
    setDeadline(d);
    setErrors((prev) => ({ ...prev, deadline: validateDeadline(d) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const vErr = validateValue(value);
    const dErr = validateDeadline(deadline);
    setErrors({ value: vErr, deadline: dErr });
    if (vErr || dErr) return;

    onSave({
      value: Number(value),
      deliveryDeadline: deadline ? new Date(deadline).toISOString() : null,
    });
  };

  return (
    <div
      className="ebm-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="ebm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="ebm-title">Editing Bid #{bid.bidId}</h3>

        <form onSubmit={handleSubmit} className="ebm-form">
          <label className="ebm-label">
            Price (€)
            <input
              type="number"
              min="0"
              step="1.00"
              className={`ebm-input ${errors.value ? "invalid" : ""}`}
              value={value}
              onChange={handleValueChange}
              onBlur={handleValueChange}
              aria-invalid={!!errors.value}
              aria-describedby={errors.value ? "err-price" : undefined}
              required
            />
            {errors.value ? (
              <span id="err-price" className="ebm-error">
                {errors.value}
              </span>
            ) : (
              <small className="ebm-help">
                Enter a positive amount (up to 2 decimals).
              </small>
            )}
          </label>

          <label className="ebm-label">
            Deadline
            <input
              type="date"
              className={`ebm-input ${errors.deadline ? "invalid" : ""}`}
              value={deadline}
              onChange={handleDeadlineChange}
              onBlur={handleDeadlineChange}
              min={minDeadlineISO || undefined}
              max={maxDeadlineISO || undefined}
              aria-invalid={!!errors.deadline}
              aria-describedby={errors.deadline ? "err-deadline" : undefined}
              required
            />
            {errors.deadline ? (
              <span id="err-deadline" className="ebm-error">
                {errors.deadline}
              </span>
            ) : (
              <small className="ebm-help">
                {minDeadlineISO && maxDeadlineISO
                  ? `Deadline must be between ${minDeadlineISO} and ${maxDeadlineISO}.`
                  : minDeadlineISO
                  ? `Deadline must be after ${minDeadlineISO}.`
                  : maxDeadlineISO
                  ? `Deadline must be before ${maxDeadlineISO}.`
                  : "Select a valid deadline date."}
              </small>
            )}
          </label>

          <div className="ebm-actions">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
              type="button"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={saving || hasErrors}
            >
              {saving ? "Updating…" : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
