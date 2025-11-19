import React from 'react';
import "./DateFields.css";

export default function DateFields({ pickupDate, deliveryDate, onChange }) {
  return (
    <div className="row">
      <div className="field">
        <label>Data de recolha</label>
        <input type="date" value={pickupDate} onChange={(e) => onChange('pickupDate', e.target.value)} />
      </div>
      <div className="field">
        <label>Data de entrega</label>
        <input type="date" value={deliveryDate} onChange={(e) => onChange('deliveryDate', e.target.value)} />
      </div>
    </div>
  );
}
