import React, { useEffect, useState } from "react";
import "../styles/BidGoPage.css";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router";
import { useMe } from "../hooks/useMe";
import TransportCard from "../components/domain/TransportCard";
import StatusMessage from "../components/feedback/StatusMessage";
import FiltersPanel from "../components/form/FiltersPanel";
import { normalizeTransportList } from "../utils/normalizers";

function BidGoPage() {
    const [requests, setRequests] = useState([]);
    const [isRequestsEmpty, setIsRequestsEmpty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { role, userId, isDriver, isCompany, loading: meLoading } = useMe();

    // 🔎 Filters (used only for Driver)
    const [filters, setFilters] = useState({
        origin: "",
        destination: "",
        deliveryDate: "", // asc | desc
        priceOrder: "", // asc | desc
    });

    // 👁️ Toggle for filters (closed by default)
    const [showFilters, setShowFilters] = useState(false);

    // Normalization now in utils/normalizers.js (normalizeTransportList)

    // Helpers
    const buildQuery = (f) => {
        const params = new URLSearchParams();
        if (f.origin) params.append("origin", f.origin);
        if (f.destination) params.append("destination", f.destination);
        if (f.deliveryDate) params.append("deliveryDate", f.deliveryDate); // asc | desc
        if (f.priceOrder) params.append("priceOrder", f.priceOrder); // asc | desc
        return params.toString();
    };

    const fetchCompanyTransports = async (signal) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        setIsRequestsEmpty(false);
        try {
            const res = await api.get(`/transports/company/${userId}`, { signal });
            const normalized = normalizeTransportList(res?.data);
            setRequests(normalized);
            if (normalized.length === 0) setIsRequestsEmpty(true);
        } catch (err) {
            if (api.isCancel?.(err) || err.name === "CanceledError") return;
            if (err.response) {
                setError(
                    `Server error: ${err.response.status} ${err.response.statusText}`
                );
            } else if (err.request) {
                setError("Network error: no response from server");
            } else {
                setError(`Request error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDriverTransports = async (signal, currentFilters) => {
        setLoading(true);
        setError(null);
        setIsRequestsEmpty(false);
        try {
            const qs = buildQuery(currentFilters || filters);
            const url = qs
                ? `/pageTransports/filters?${qs}`
                : `/pageTransports/filters`;
            const res = await api.get(url, { signal });
            const normalized = normalizeTransportList(res?.data);
            setRequests(normalized);
            if (normalized.length === 0) setIsRequestsEmpty(true);
        } catch (err) {
            if (api.isCancel?.(err) || err.name === "CanceledError") return;
            if (err.response) {
                setError(
                    `Server error: ${err.response.status} ${err.response.statusText}`
                );
            } else if (err.request) {
                setError("Network error: no response from server");
            } else {
                setError(`Request error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // 🧠 Fetch data depending on user type
    useEffect(() => {
        const controller = new AbortController();
        if (isCompany && userId) {
            fetchCompanyTransports(controller.signal);
        } else if (isDriver) {
            fetchDriverTransports(controller.signal);
        }
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDriver, isCompany, userId]);

    // 🕐 Loading states
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
                                onApply={(f) => {
                                    setFilters(f);
                                    const controller = new AbortController();
                                    fetchDriverTransports(controller.signal, f);
                                    setTimeout(() => controller.abort(), 30000);
                                }}
                                onClear={(cleared) => {
                                    setFilters(cleared);
                                    const controller = new AbortController();
                                    fetchDriverTransports(controller.signal, cleared);
                                    setTimeout(() => controller.abort(), 30000);
                                }}
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
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
