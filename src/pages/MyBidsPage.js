import React, { useRef, useState, useEffect } from "react";
import api from "../api/axiosConfig";
import "../styles/LoginPage.css";

export default function MyBidsPage() {
	const [bids, setBids] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const abortRef = useRef(null);

	useEffect(() => {
		const controller = new AbortController();
		abortRef.current = controller;

		const fetchBids = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get("/bids/bidsByDriver", { signal: controller.signal });
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
	}, []);

	return (
		<div>
	
			<div className="login-page" style={{ paddingTop: 24 }}>
				<div className="login-container">
					<div className="login-form" style={{ width: 'min(980px, 95%)' }}>
						<h2 className="login-title">Minhas Bids</h2>

						{loading && <p>Carregando bids…</p>}
						{error && <p className="error-message">{error}</p>}

						{!loading && !error && (
							<div>
								{bids.length === 0 && <p>Nenhuma bid encontrada.</p>}
								{bids.map((bid) => (
									<div key={bid.id || bid.bidId || JSON.stringify(bid)} style={{ border: '1px solid #e3e8ef', padding: 12, borderRadius: 8, marginBottom: 12 }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
											<div>
												<strong>Pedido:</strong> {bid.requestId ?? bid.request?.id ?? '—'}
												<div><strong>Valor:</strong> {bid.amount ?? bid.value ?? '—'}</div>
												<div><strong>Estado:</strong> {bid.status ?? bid.state ?? '—'}</div>
											</div>
											<div style={{ textAlign: 'right' }}>
												<div><strong>Data:</strong> {bid.createdAt ? new Date(bid.createdAt).toLocaleString() : bid.date ?? '—'}</div>
												<div><strong>ID:</strong> {bid.id ?? bid.bidId ?? '—'}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}