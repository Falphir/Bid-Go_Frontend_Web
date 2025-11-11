import React, { useEffect, useState } from "react";
import "../styles/BidGoPage.css";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router";
import Countdown from "../components/Countdown";
import { useMe } from "../hooks/useMe";
function BidGoPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { role, userId, isDriver, isCompany, loading: meLoading } = useMe();

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetched transports for company ID:", userId);
      try {
        const res = await api.get(`/transports/company/${userId}`, {
          signal: controller.signal,
        });

        setRequests(res.data);
      } catch (err) {
        if (api.isCancel?.(err) || err.name === "CanceledError") return;
        if (err.response) {
          // Server responded with a non-2xx status
          setError(
            `Server error: ${err.response.status} ${err.response.statusText}`
          );
        } else if (err.request) {
          // No response received
          setError("Network error: no response from server" + err.request);
        } else {
          // Something else happened while setting up the request
          setError(`Request error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);
  // Data for each of the active requests.  In a real application this might
  // come from an API, but here it's hard‑coded for clarity and simplicity
  if (meLoading) return <p className="status-message">A validar sessão…</p>;
  if (loading) return <p>Loading users…</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div className="page-container">
      {/* Header */}

      {/* Main content */}
      <main className="main-content">
        <h2 className="section-title">Pedidos de Transporte</h2>
        <button className="new-request-btn">Novo Pedido de Transporte</button>
        <div className="cards-container">
          {requests.map((req) => {
            const transport = req; // manter nomenclatura 'transport' como pedido
            // resolve status from multiple possible fields
            const statusRaw = req?.status ?? null;
            const statusText = (() => {
              if (statusRaw == null) return null;
              if (typeof statusRaw === "number") {
                // Map numeric enum values to names (matches backend ERequestStatus)
                switch (statusRaw) {
                  case 0:
                    return "Active";
                  case 1:
                    return "Canceled";
                  case 2:
                    return "Completed";
                  case 3:
                    return "Pending";
                  case 4:
                    return "InTransit";
                  case 5:
                    return "Draft";
                  case 6:
                    return "WaitingPickup";
                  default:
                    return String(statusRaw);
                }
              }
              if (typeof statusRaw === "boolean")
                return statusRaw ? "Canceled" : "Active";
              return String(statusRaw);
            })();

            const statusClass = statusText
              ? `status-${statusText.toLowerCase()}`
              : "";

            return (
              <div className="card" key={req.id}>
                <div className="card-image">
                  <img src={req.image} alt={req.package} />
                </div>
                <div className="card-body">
                  <div className="title-with-badge">
                    <h3 className="card-title">{req.package}</h3>
                    {statusText && (
                      <span className={`status-badge ${statusClass}`}>
                        {statusText}
                      </span>
                    )}
                  </div>
                  <p className="card-route">{req.route}</p>
                  <div>
                    {req.origin} → {req.destination}
                  </div>
                  <div>
                    <span className="label-small">Max Price:</span>{" "}
                    {req.maxPrice}€
                  </div>
                  {(() => {
                    const endDate =
                      transport?.biddingEndDate ??
                      transport?.biddingEnd ??
                      transport?.bidding_end_date ??
                      transport?.biddingEndDateUtc ??
                      transport?.biddingEnd?.date ??
                      null;

                    return (
                      <>
                        <p className="card-time">
                          Tempo Restante:{" "}
                          {endDate ? <Countdown endDate={endDate} /> : "—"}
                        </p>
                      </>
                    );
                  })()}
                  <button
                    className="bid-btn"
                    onClick={() => {
                      navigate(`/accept-bids/${req.transportRequestId}`);
                    }}
                  >
                    Licitações Abertas
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default BidGoPage;
