import React from "react";
import "../styles/BidGoPage.css";
import { useNavigate } from "react-router";
import { useMe } from "../hooks/useMe";
import TransportCard from "../components/domain/TransportCard";
import StatusMessage from "../components/feedback/StatusMessage";
import FiltersPanel from "../components/form/FiltersPanel";
import useTransports from "../hooks/useTransports";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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

    if (meLoading)
        return <StatusMessage type="loading">Validating session…</StatusMessage>;
    if (loading)
        return (
            <StatusMessage type="loading">Loading transports…</StatusMessage>
        );
    if (error) return <StatusMessage type="error">{error}</StatusMessage>;

    const list = Array.isArray(requests) ? requests : [];
    const isEmpty = list.length === 0 || isRequestsEmpty;

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
                        <button className="create-request-btn" onClick={() => navigate("/createRequest")}>
                            Create
                            <span className="icon">
                                <FontAwesomeIcon icon={faPlus} />
                            </span>
                        </button>
                    )}
                </div>

                <div className="cards-container">
                    {isEmpty ? (
                        <p className="no-bids">No requests found.</p>
                    ) : (
                        list.map((req) => (
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
            </main>
        </div>
    );
}

export default BidGoPage;
