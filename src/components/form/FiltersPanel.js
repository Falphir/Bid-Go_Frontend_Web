import React, { useState } from "react";
import "./FiltersPanel.css";

// Painel filtros listagem
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
    const cleared = {
      origin: "",
      destination: "",
      deliveryDate: "",
      priceOrder: "",
    };
    setFilters(cleared);
    onClear?.(cleared);
  };

  return (
    <form className="filters-top" onSubmit={submit}>
      <div className="filters-row">
        <input
          type="text"
          placeholder="Origin"
          value={filters.origin}
          onChange={(e) => handleChange("origin", e.target.value)}
        />
        <input
          type="text"
          placeholder="Destination"
          value={filters.destination}
          onChange={(e) => handleChange("destination", e.target.value)}
        />
        <select
          value={filters.priceOrder}
          onChange={(e) => handleChange("priceOrder", e.target.value)}
        >
          <option value="">Price</option>
          <option value="asc">Cheapest</option>
          <option value="desc">Most expensive</option>
        </select>
      </div>
      <div className="filters-actions">
        <button type="submit" className="bid-btn">
          Apply
        </button>
        <button type="button" className="bid-btn" onClick={clear}>
          Clear
        </button>
      </div>
    </form>
  );
}
