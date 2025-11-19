import React from 'react';
import "./AuctionDatesFields.css";

export default function AuctionDatesFields({ biddingStartDate, biddingEndDate, onChange }) {
  return (
    <div className="row">
      <div className="field">
        <label>Início do Leilão</label>
        <input type="date" value={biddingStartDate} onChange={(e) => onChange('biddingStartDate', e.target.value)} />
      </div>
      <div className="field">
        <label>Fim do Leilão</label>
        <input type="date" value={biddingEndDate} onChange={(e) => onChange('biddingEndDate', e.target.value)} />
      </div>
    </div>
  );
}
