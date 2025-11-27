import React from "react";
import "../styles/MyBidsPage.css";
import { useMe } from "../hooks/useMe";
import { useNavigate } from "react-router";
import StatusMessage from "../components/feedback/StatusMessage";
import StatusBadge from "../components/feedback/StatusBadge";
import useMyBids from "../hooks/useMyBids";

export default function MyBidsPage() {
    const { userId, loading: meLoading } = useMe();
    const { bids, loading, error } = useMyBids({ userId });
    const navigate = useNavigate();

    if (meLoading) return <StatusMessage type="loading">Validating session…</StatusMessage>;

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
                                        bid.id || bid.bidId || bid.transportRequestId || JSON.stringify(bid)
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
                                            onClick={() => navigate(`/transportRequest/${bid.transportRequestId}`)}
                                        >
                                            View Request
                                        </button>
                                    </div>

                                    <div className="bid-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Value:</span>
                                            <span className="meta-value">{bid.value != null ? bid.value : "—"}</span>
                                        </div>

                                        <div className="meta-item">
                                            <span className="meta-label">Delivery:</span>
                                            <span className="meta-value">
                        {bid.deliveryDeadline ? new Date(bid.deliveryDeadline).toLocaleDateString() : "—"}
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
