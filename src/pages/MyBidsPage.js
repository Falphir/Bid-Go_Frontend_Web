import React, { useRef, useState, useEffect } from "react";
import api from "../api/axiosConfig";
import "../styles/MyBidsPage.css";
import { useMe } from "../hooks/useMe";
import { useNavigate } from "react-router";
import StatusMessage from "../components/feedback/StatusMessage";
import StatusBadge from "../components/feedback/StatusBadge";

export default function MyBidsPage() {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);
    const { userId, loading: meLoading } = useMe();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const controller = new AbortController();
        abortRef.current = controller;

        const fetchBids = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/bids/bidsByDriver/${userId}`, {
                    signal: controller.signal,
                });
                setBids(res.data || []);
            } catch (err) {
                if (err.name === "CanceledError") return;
                if (err.response)
                    setError(
                        err.response.data?.message ||
                        `Error ${err.response.status}`
                    );
                else if (err.request)
                    setError("Network failure: no response from server.");
                else setError(`Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBids();

        return () => controller.abort();
    }, [userId]);

    if (meLoading)
        return <StatusMessage type="loading">Validating session…</StatusMessage>;

    return (
        <div className="my-bids-page-root">
            <main className="my-bids-container">
                <section className="my-bids-panel">
                    <h2 className="my-bids-title">My Bids</h2>

                    {loading && <p className="info-text">Loading bids…</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && !error && (
                        <div className="bids-list">
                            {bids.length === 0 && (
                                <p className="info-text">No bids found.</p>
                            )}

                            {bids.map((bid) => (
                                <article
                                    className="bid-card"
                                    key={
                                        bid.id ||
                                        bid.bidId ||
                                        bid.transportRequestId ||
                                        JSON.stringify(bid)
                                    }
                                >
                                    <div className="bid-header">
                                        <div className="bid-heading">
                                            <div className="bid-id">
                                                Request #{bid.transportRequestId ?? "—"}
                                            </div>
                                            <div className="badges-row">
                                                <StatusBadge
                                                    status={bid.transportRequest?.status}
                                                    prefix="Request:"
                                                />
                                                <StatusBadge status={bid.status} prefix="Bid:" />
                                            </div>
                                        </div>

                                        <button
                                            className="bid-btn"
                                            onClick={() =>
                                                navigate(`/transportRequest/${bid.transportRequestId}`)
                                            }
                                        >
                                            View Request
                                        </button>
                                    </div>

                                    <div className="bid-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Value:</span>
                                            <span className="meta-value">
                        {bid.value != null ? bid.value : "—"}
                      </span>
                                        </div>

                                        <div className="meta-item">
                                            <span className="meta-label">Delivery:</span>
                                            <span className="meta-value">
                        {bid.deliveryDeadline
                            ? new Date(bid.deliveryDeadline).toLocaleDateString()
                            : "—"}
                      </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
