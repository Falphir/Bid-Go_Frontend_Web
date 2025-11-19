import React, { useState } from 'react';
import "./FiltersPanel.css";

// Painel de filtros reutilizável (extraído de BidGoPage)
// Mantém classes CSS: filters-top, filters-row, filters-actions, bid-btn
export default function FiltersPanel({ initialFilters, onApply, onClear }) {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (field, value) => {
    setFilters((f) => ({ ...f, [field]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onApply?.(filters);
  };

  const clear = () => {
    const cleared = { origin: '', destination: '', deliveryDate: '', priceOrder: '' };
    setFilters(cleared);
    onClear?.(cleared);
  };

  return (
    <form className="filters-top" onSubmit={submit}>
      <div className="filters-row">
        <input
          type="text"
          placeholder="Origem"
          value={filters.origin}
          onChange={(e) => handleChange('origin', e.target.value)}
        />
        <input
          type="text"
          placeholder="Destino"
          value={filters.destination}
          onChange={(e) => handleChange('destination', e.target.value)}
        />
        <select
          value={filters.priceOrder}
          onChange={(e) => handleChange('priceOrder', e.target.value)}
        >
          <option value="">Preço</option>
          <option value="asc">Mais barato</option>
          <option value="desc">Mais caro</option>
        </select>
      </div>
      <div className="filters-actions">
        <button type="submit" className="bid-btn">Aplicar</button>
        <button type="button" className="bid-btn" onClick={clear}>Limpar</button>
      </div>
    </form>
  );
}
