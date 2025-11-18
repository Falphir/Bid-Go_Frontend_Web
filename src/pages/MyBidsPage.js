import React, { useRef, useState, useEffect } from "react";
import api from "../api/axiosConfig";
import "../styles/MyBidsPage.css";
import { useMe } from "../hooks/useMe";
import { useNavigate } from "react-router";

export default function MyBidsPage() {
	const [bids, setBids] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const abortRef = useRef(null);
	const { userId, loading: meLoading } = useMe();
	const navigate = useNavigate();

	const prettyLabel = (value) => {
		if (!value || typeof value !== "string") return "—";
		return value
			.replace(/[_-]+/g, " ")
			.toLowerCase()
			.replace(/\s+/g, " ")
			.trim()
			.replace(/\b\w/g, (c) => c.toUpperCase());
	};

	const statusClass = (raw) => {
		if (!raw || typeof raw !== "string") return "status-unknown";
		const norm = raw.toLowerCase().replace(/[^a-z]/g, "");
		const alias = {
			intransit: "intransit",
			intransito: "intransit",
			waitingpickup: "waitingpickup",
			waitingforpickup: "waitingpickup",
			accepted: "accepted",
			approved: "accepted",
			rejected: "rejected",
			canceled: "canceled",
			cancelled: "canceled",
			completed: "completed",
			finished: "completed",
			active: "active",
			pending: "pending",
			draft: "draft",
		};
		return `status-${alias[norm] || norm || "unknown"}`;
	};

	useEffect(() => {
		// wait until we have the userId from useMe
		if (!userId) return;

		const controller = new AbortController();
		abortRef.current = controller;

		const fetchBids = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get(`/bids/bidsByDriver/${userId}`, { signal: controller.signal });
				setBids(res.data || []);
			} catch (err) {
				if (err.name === "CanceledError") return;
				if (err.response) setError(err.response.data?.message || `Erro ${err.response.status}`);
				else if (err.request) setError("Falha de rede: sem resposta do servidor.");
				else setError(`Erro: ${err.message}`);
			} finally {
				setLoading(false);
			}
		};

		fetchBids();

		return () => controller.abort();
	}, [userId]);

	if (meLoading) return <p className="status-message">A validar sessão…</p>;

	return (
		<div className="my-bids-page-root">
			<main className="my-bids-container">
				<section className="my-bids-panel">
					<h2 className="my-bids-title">Minhas Bids</h2>

					{loading && <p className="info-text">Carregando bids…</p>}
					{error && <p className="error-message">{error}</p>}

					{!loading && !error && (
						<div className="bids-list">
							{bids.length === 0 && <p className="info-text">Nenhuma bid encontrada.</p>}
							{bids.map((bid) => (
									<article className="bid-card" key={bid.id || bid.bidId || bid.transportRequestId || JSON.stringify(bid)}>
										<div className="bid-header">
											<div className="bid-heading">
												<div className="bid-id">Pedido #{bid.transportRequestId ?? '—'}</div>
												<div className="badges-row">
													<span className={`status-badge ${statusClass(bid.transportRequest?.status)}`}>Pedido: {prettyLabel(bid.transportRequest?.status)}</span>
													<span className={`status-badge ${statusClass(bid.status)}`}>Bid: {prettyLabel(bid.status)}</span>
												</div>
											</div>
											<button className="bid-btn" onClick={() => navigate(`/transportRequest/${bid.transportRequestId}`)}>Ver pedido</button>
										</div>

										<div className="bid-meta">
											<div className="meta-item"><span className="meta-label">Valor:</span><span className="meta-value">{bid.value != null ? bid.value : '—'}</span></div>
											<div className="meta-item"><span className="meta-label">Entrega:</span><span className="meta-value">{bid.deliveryDeadline ? new Date(bid.deliveryDeadline).toLocaleDateString() : '—'}</span></div>
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