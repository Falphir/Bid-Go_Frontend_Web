import React, {useEffect, useState} from 'react';
import '../styles/BidGoPage.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";


function BidGoPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/pageTransports/filters", {
          signal: controller.signal,
          headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaWd1ZWxAZ21haWwuY29tIiwidXNlcklkIjoiMiIsInVzZXJUeXBlIjoiQ29tcGFueSIsImV4cCI6MTc2Mjc3NjY5NCwiaXNzIjoiQmlkR29CYWNrZW5kIiwiYXVkIjoiQmlkR29Gcm9udGVuZCJ9.OJIOZLVMVuzzU7ja6DWG2ROZgvogM_ZZbrzD_ajSQ_4` }
        });
        setRequests(res.data);
      } catch (err) {

      if (axios.isCancel?.(err) || err.name === 'CanceledError') return;
      if (err.response) {
        // Server responded with a non-2xx status
        setError(`Server error: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        // No response received
        setError('Network error: no response from server' + err.request);
      } else {
        // Something else happened while setting up the request
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
    }

    fetchData();
    return () => controller.abort();
  }, []);
  // Data for each of the active requests.  In a real application this might
  // come from an API, but here it's hard‑coded for clarity and simplicity

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
          {requests.map((req) => (
            <div className="card" key={req.id}>
              <div className="card-image">
                <img src={req.image} alt={req.package} />
              </div>
              <div className="card-body">
                <h3 className="card-title">{req.package}</h3>
                <p className="card-route">{req.route}</p>
                <div>{req.origin} → {req.destination}</div>
                <div>{req.maxPrice}</div>
                <p className="card-time">Tempo Restante: {req.timeRemaining}</p>
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
          ))}
        </div>
      </main>
    </div>
  );
}

export default BidGoPage;