import React, { useMemo } from "react";
import { useMe } from "../hooks/useMe";
import "../styles/HistoryPage.css";
import StatusMessage from "../components/feedback/StatusMessage";
import HistoryTable from "../components/history/HistoryTable";
import useHistory from "../hooks/useHistory";

/**
 * History page displaying either bidding history for drivers or
 * transport request history for companies.
 *
 * It uses {@link useMe} to determine the current user role and
 * {@link useHistory} to load normalized history items, rendering them
 * in a dynamic {@link HistoryTable}.
 *
 * @returns {JSX.Element} Rendered history page.
 */
function HistoryPage() {
  const { userId, isDriver, isCompany, loading: meLoading } = useMe();
  const { items, loading, error } = useHistory({ userId, isDriver, isCompany });

  const columns = useMemo(() => {
    if (isDriver) {
      return [
        { key: "companyName", label: "Company Name" },
        { key: "package", label: "Package" },
        { key: "date", label: "Date" },
        { key: "destination", label: "Destination" },
        { key: "price", label: "Price" },
        { key: "status", label: "Status" },
        { key: "rating", label: "Rating" },
      ];
    }

    return [
      { key: "requestId", label: "Request ID" },
      { key: "package", label: "Package" },
      { key: "driverName", label: "Driver Name" },
      { key: "date", label: "Date" },
      { key: "destination", label: "Destination" },
      { key: "price", label: "Price" },
      { key: "status", label: "Status" },
    ];
  }, [isDriver]);

  if (meLoading)
    return <StatusMessage type="loading">Validating session…</StatusMessage>;
  if (loading)
    return <StatusMessage type="loading">Loading history…</StatusMessage>;
  if (error) return <StatusMessage type="error">{error}</StatusMessage>;

  const title = isDriver
    ? "Bidding History"
    : isCompany
    ? "Transport Requests History"
    : "History";

  return (
    <div className="history-page">
      <h2 className="section-title">{title}</h2>
      <HistoryTable
        columns={columns}
        rows={items}
        emptyMessage="No records to display."
      />
    </div>
  );
}

export default HistoryPage;
