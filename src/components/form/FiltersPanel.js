/**
 * @typedef {Object} Filters
 * @property {string} origin
 * @property {string} destination
 * @property {string} deliveryDate
 * @property {"asc"|"desc"|""} priceOrder
 */

/**
 * @typedef {Object} FiltersPanelProps
 * @property {Filters} initialFilters - Initial set of filter values.
 * @property {function(Filters): void} [onApply] - Callback invoked when the user applies the filters.
 * @property {function(Filters): void} [onClear] - Callback invoked after filters are cleared.
 */

import React, { useState } from "react";
import "./FiltersPanel.css";


/**
 * Top panel with origin/destination and price filters for transport lists.
 *
 * @param {FiltersPanelProps} props - Filter values and callbacks.
 * @returns {JSX.Element} Rendered filters panel form.
 */
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
