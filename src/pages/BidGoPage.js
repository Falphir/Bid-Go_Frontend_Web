import React, {useEffect, useState} from 'react';
import '../styles/BidGoPage.css';
import api from "../api/axiosConfig";
import { useNavigate } from "react-router";


function BidGoPage() {
  const [requests, setRequests] = useState([]);
  const [isRequestsEmpty, setIsRequestsEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

    const normalizeList = (data) => {
        const arr = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.results)
                    ? data.results
                    : [];

        return arr.map((t) => ({
            id: t.id ?? t.transportRequestId ?? t.transportId,
            image: t.image ?? "https://via.placeholder.com/400x250",
            package: t.package ?? t.title ?? "Pedido",
            route: t.route ?? "",
            origin: t.origin ?? t.from ?? "—",
            destination: t.destination ?? t.to ?? "—",
            maxPrice: t.maxPrice ?? t.maxBudget ?? "—",
            timeRemaining: t.timeRemaining ?? "",
        }));
    };

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
          const res = await api.get("/pageTransports/filters", {
              signal: controller.signal,
          });

          setRequests(normalizeList(res?.data));

          console.log(res.data);
          console.log(requests);

          if (res.data.length === 0) {
              console.log('No active requests found.');
              setIsRequestsEmpty(true);
          }
      } catch (err) {

              if (api.isCancel?.(err) || err.name === 'CanceledError') return;
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

    const list = Array.isArray(requests) ? requests : [];
    const isEmpty = list.length === 0;

  return (
    <div className="page-container">
      {/* Header */}

      {/* Main content */}
      <main className="main-content">
        <button className="new-request-btn">+ Novo Pedido de Transporte</button>
        <h2 className="section-title">Pedidos Ativos:</h2>
        <div className="cards-container">
            {isRequestsEmpty ? (
                <p className="no-bids">Nenhum pedido ativo encontrado.</p>
            ) : (
                list.map((req) => (
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
                            <p className="card-time">Tempo Restante: {req.timeRemaining}</p>
                            <button
                                className="bid-btn"
                                onClick={() => navigate(`/accept-bids/${req.id}`)}
                            >
                                Licitações Abertas
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
}

export default BidGoPage;