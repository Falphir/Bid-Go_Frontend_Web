import React, { useRef, useState, useEffect } from "react";
import api from "../api/axiosConfig";
import "../styles/MyBidsPage.css";
import { useMe } from "../hooks/useMe";

export default function MyBidsPage() {
	const [bids, setBids] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const abortRef = useRef(null);
	const { userId, loading: meLoading } = useMe();

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
									<div className="bid-left">
										<div className="bid-field"><span className="kw">Pedido (ID):</span> {bid.transportRequestId ?? '—'}</div>
										<div className="bid-field"><span className="kw">Valor:</span> {bid.value != null ? bid.value : '—'}</div>
										<div className="bid-field"><span className="kw">Data de Entrega:</span> {bid.deliveryDeadline ? new Date(bid.deliveryDeadline).toLocaleDateString() : '—'}</div>
									</div>
									<div className="bid-right">
										<div className="bid-field"><span className="kw">Estado da Bid:</span> {bid.status ?? '—'}</div>
										<div className="bid-field"><span className="kw">Estado do Pedido:</span> {bid.transportRequest?.status ?? '—'}</div>
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