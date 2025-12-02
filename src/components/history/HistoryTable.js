import React from "react";
import "./HistoryTable.css";

// Tabela genérica de histórico com colunas dinâmicas
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
