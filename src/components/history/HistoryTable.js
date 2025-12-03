/**
 * @typedef {Object} HistoryColumn
 * @property {string} key - Key used to read the value from each row object.
 * @property {string} label - Column header label.
 */

/**
 * @typedef {Object} HistoryTableProps
 * @property {HistoryColumn[]} columns - Column definitions to render.
 * @property {Object[]} rows - Row data objects, each containing values for the given keys.
 * @property {string} [emptyMessage] - Message displayed when there are no rows.
 */

import React from "react";
import "./HistoryTable.css";


/**
 * Generic, column-driven history table component.
 *
 * It renders a table head based on `columns` and one row per entry in
 * `rows`, using the column keys to read values. When there are no
 * rows, it shows the `emptyMessage` instead.
 *
 * @param {HistoryTableProps} props - Column configuration and table data.
 * @returns {JSX.Element} Rendered history table or fallback message.
 */
export default function HistoryTable({
  columns = [],
  rows = [],
  emptyMessage = "No history available to display.",
}) {
  const isEmpty = !rows || rows.length === 0;
  if (isEmpty) return <p className="no-bids">{emptyMessage}</p>;

  return (
    <div className="table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.requestId ?? row.id ?? idx}>
              {columns.map((c) => (
                <td key={c.key}>{row[c.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
