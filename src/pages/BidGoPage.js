import React, { useEffect, useState } from "react";
import "../styles/BidGoPage.css";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router";
import Countdown from "../components/Countdown";
import { useMe } from "../hooks/useMe";

function BidGoPage() {
    const [requests, setRequests] = useState([]);
    const [isRequestsEmpty, setIsRequestsEmpty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { role, userId, isDriver, isCompany, loading: meLoading } = useMe();

    // 🧩 Função para normalizar o formato da resposta da API
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
            biddingEndDate: t.biddingEndDate ?? t.biddingEnd ?? t.bidding_end_date ?? null,
            status: t.status ?? null,
        }));
    };

    // 🧠 Buscar transportes da empresa do utilizador
    useEffect(() => {
        if (!userId) return; // Aguarda userId

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            console.log("Fetched transports for company ID:", userId);

            try {
                const res = await api.get(`/transports/company/${userId}`, {
                    signal: controller.signal,
                });

                const normalized = normalizeList(res?.data);
                setRequests(normalized);

                if (normalized.length === 0) {
                    console.log("No active requests found.");
                    setIsRequestsEmpty(true);
                }
            } catch (err) {
                if (api.isCancel?.(err) || err.name === "CanceledError") return;

                if (err.response) {
                    setError(`Server error: ${err.response.status} ${err.response.statusText}`);
                } else if (err.request) {
                    setError("Network error: no response from server");
                } else {
                    setError(`Request error: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [userId]);

    // 🕐 Estados de carregamento
    if (meLoading) return <p className="status-message">A validar sessão…</p>;
    if (loading) return <p className="status-message">A carregar transportes…</p>;
    if (error) return <p className="status-message error">{error}</p>;

    const list = Array.isArray(requests) ? requests : [];
    const isEmpty = list.length === 0 || isRequestsEmpty;

    return (
        <div className="page-container">
            <main className="main-content">
                <h2 className="section-title">Pedidos de Transporte</h2>
                <button
                    className="new-request-btn"
                    onClick={() => navigate("/createRequest")}
                >
                    Novo Pedido de Transporte
                </button>

                <div className="cards-container">
                    {isEmpty ? (
                        <p className="no-bids">Nenhum pedido encontrado.</p>
                    ) : (
                        list.map((req) => {
                            const transport = req;

                            // Resolver o status
                            const statusRaw = req?.status ?? null;
                            const statusText = (() => {
                                if (statusRaw == null) return null;
                                if (typeof statusRaw === "number") {
                                    switch (statusRaw) {
                                        case 0: return "Active";
                                        case 1: return "Canceled";
                                        case 2: return "Completed";
                                        case 3: return "Pending";
                                        case 4: return "InTransit";
                                        case 5: return "Draft";
                                        case 6: return "WaitingPickup";
                                        default: return String(statusRaw);
                                    }
                                }
                                if (typeof statusRaw === "boolean")
                                    return statusRaw ? "Canceled" : "Active";
                                return String(statusRaw);
                            })();

                            const statusClass = statusText
                                ? `status-${statusText.toLowerCase()}`
                                : "";

                            // Corrigir data de fim de leilão
                            const endDate = transport?.biddingEndDate
                                ? new Date(transport.biddingEndDate)
                                : null;

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

                                        <p className="card-time">
                                            {statusText?.toLowerCase() === "active" ? (
                                                <>
                                                    Tempo Restante:{" "}
                                                    {endDate ? (
                                                        <Countdown endDate={endDate} />
                                                    ) : (
                                                        "—"
                                                    )}
                                                </>
                                            ) : (
                                                "\u00A0" /* preserva o espaço/altura sem mostrar o campo */
                                            )}
                                        </p>

                                        <button
                                            className="bid-btn"
                                            onClick={() => navigate(`/accept-bids/${req.id}`)}
                                        >
                                            Ver Pedido
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}

export default BidGoPage;
