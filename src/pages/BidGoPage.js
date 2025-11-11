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
      console.log('Fetched transports for company ID:', userId);
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
        <button className="new-request-btn">+ Novo Pedido de Transporte</button>
        <h2 className="section-title">Pedidos Ativos:</h2>
        <div className="cards-container">
          {requests.map((req) => {
            const transport = req; // manter nomenclatura 'transport' como pedido
            return (
            <div className="card" key={req.id}>
              <div className="card-image">
                <img src={req.image} alt={req.package} />
              </div>
              <div className="card-body">
                <h3 className="card-title">{req.package}</h3>
                <p className="card-route">{req.route}</p>
                <div>
                  {req.origin} → {req.destination}
                </div>
                <div>{req.maxPrice}</div>
                {/* Resolve possíveis diferenças no shape retornado pela API */}
                {(() => {
                  // Tentativa de localizar a data de fim do leilão em vários nomes comuns
                  const endDate = transport?.biddingEndDate ?? transport?.biddingEnd ?? transport?.bidding_end_date ?? transport?.biddingEndDateUtc ?? transport?.biddingEnd?.date ?? null;
                  // debug: facilita ver o objecto retornado durante o desenvolvimento
                  // console.debug('Transport item', transport, 'resolved endDate:', endDate);

                  return (
                    <>
                      <p className="card-time">
                        Tempo Restante: {endDate ? <Countdown endDate={endDate} /> : '—'}
                      </p>
                    </>
                  );
                })()}
                <button
                  className="bid-btn"
                  onClick={() => {
                    navigate(`/accept-bids/${req.id}`);
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
