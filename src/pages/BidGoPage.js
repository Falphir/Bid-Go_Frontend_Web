import React, { useState, useEffect } from "react";
import "../styles/BidGoPage.css";
import { useNavigate } from "react-router";
import { useMe } from "../hooks/useMe";
import TransportCard from "../components/domain/TransportCard";
import StatusMessage from "../components/feedback/StatusMessage";
import FiltersPanel from "../components/form/FiltersPanel";
import useTransports from "../hooks/useTransports";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pagination from "../components/pagination/Pagination";

/**
 * Main page of the Bid-Go web application.
 *
 * For drivers, it displays a list of available transport requests that
 * can be filtered and paginated. For companies, it shows their own
 * created transport requests and allows navigation to the creation
 * screen.
 *
 * The page relies on {@link useMe} to detect the current user role and
 * {@link useTransports} to load and manage the list of transports,
 * including filters and pagination.
 *
 * @returns {JSX.Element} Rendered Bid-Go main page component.
 */

function BidGoPage() {
  const navigate = useNavigate();
  const { userId, isDriver, isCompany, loading: meLoading } = useMe();
  const {
    requests,
    isRequestsEmpty,
    loading,
    error,
    filters,
    showFilters,
    setShowFilters,
    applyFilters,
    clearFilters,
  } = useTransports({ userId, isDriver, isCompany });
  const CARDS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const list = Array.isArray(requests) ? requests : [];
  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);
  const isEmptySafe =
    !Array.isArray(list) || list.length === 0 || isRequestsEmpty;
  const totalPages = !isEmptySafe ? Math.ceil(list.length / CARDS_PER_PAGE) : 1;
  const paginatedList = !isEmptySafe
    ? list.slice(
        (currentPage - 1) * CARDS_PER_PAGE,
        currentPage * CARDS_PER_PAGE
      )
    : [];

  if (meLoading)
    return <StatusMessage type="loading">Validating session…</StatusMessage>;
  if (loading)
    return <StatusMessage type="loading">Loading transports…</StatusMessage>;
  if (error) return <StatusMessage type="error">{error}</StatusMessage>;

  return (
    <div className="page-container">
      <main className="main-content">
        {isDriver && (
          <div className="filters-top-wrapper">
            <button
              type="button"
              className={`filters-toggle-top ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              aria-controls="filtersTopPanel"
            >
              {showFilters ? "Hide filters" : "Show filters"}
            </button>

            {showFilters && (
              <FiltersPanel
                initialFilters={filters}
                onApply={(f) => applyFilters(f)}
                onClear={(cleared) => clearFilters(cleared)}
              />
            )}
          </div>
        )}

        <div className="title-row">
          <h2 className="section-title">
            {isDriver
              ? "Available Transports for Bidding"
              : "Transport Requests"}
          </h2>

          {!isDriver && (
            <button
              className="create-request-btn"
              onClick={() => navigate("/createRequest")}
            >
              Create
              <span className="icon">
                <FontAwesomeIcon icon={faPlus} />
              </span>
            </button>
          )}
        </div>

        <div className="cards-container">
          {isEmptySafe ? (
            <p className="no-bids">No requests found.</p>
          ) : (
            paginatedList.map((req) => (
              <TransportCard
                key={req.id}
                data={req}
                isCompany={isCompany}
                isDriver={isDriver}
                onView={(id) => navigate(`/transportRequest/${id}`)}
              />
            ))
          )}
        </div>
        {!isEmptySafe && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}

export default BidGoPage;
