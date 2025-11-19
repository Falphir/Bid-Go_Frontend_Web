import React from 'react';
import Countdown from '../../components/Countdown';

// Card de transporte reutilizável. Mantém classes CSS existentes.
export default function TransportCard({ data, isCompany, isDriver, onView }) {
  if (!data) return null;
  const {
    id,
    image,
    package: pkg,
    route,
    origin,
    destination,
    maxPrice,
    biddingEndDate,
    status
  } = data;

  // Determinar texto de status (replica lógica original)
  const statusText = (() => {
    if (status == null) return null;
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Active';
        case 1: return 'Canceled';
        case 2: return 'Completed';
        case 3: return 'Pending';
        case 4: return 'InTransit';
        case 5: return 'Draft';
        case 6: return 'WaitingPickup';
        default: return String(status);
      }
    }
    if (typeof status === 'boolean') return status ? 'Canceled' : 'Active';
    return String(status);
  })();

  const statusClass = statusText ? `status-${statusText.toLowerCase()}` : '';
  const endDate = biddingEndDate ? new Date(biddingEndDate) : null;

  return (
    <div className="card" key={id}>
      <div className="card-image">
        <img src={image} alt={pkg} />
      </div>
      <div className="card-body">
        <div className="title-with-badge">
          <h3 className="card-title">{pkg}</h3>
          {statusText && <span className={`status-badge ${statusClass}`}>{statusText}</span>}
        </div>
        <p className="card-route">{route}</p>
        <div>{origin} → {destination}</div>
        <div><span className="label-small">Preço Máx:</span> {maxPrice}€</div>
        <p className="card-time">
          {isCompany && statusText?.toLowerCase() === 'active' ? (
            <>Tempo Restante: {endDate ? <Countdown endDate={endDate} /> : '—'}</>
          ) : '\u00A0'}
          {isDriver && (
            <>Fim das Licitações: {endDate ? <Countdown endDate={endDate} /> : '—'}</>
          )}
        </p>
        <button className="bid-btn" onClick={() => onView?.(id)}>Ver pedido</button>
      </div>
    </div>
  );
}
