import React, { useRef, useState, useEffect } from "react";
import "../styles/RegisterPage.css";
import { useNavigate } from "react-router";
import api from "../api/axiosConfig";
import logo from "../assets/logo.png";
import PasswordInput from "../components/PasswordInput";
import { getApiErrorMessage } from "../utils/httpError";

function RegisterPage() {
	const [mode, setMode] = useState(null); // 'driver' | 'company' | null

	// driver form state
	const [dName, setDName] = useState("");
	const [dEmail, setDEmail] = useState("");
	const [dPassword, setDPassword] = useState("");
	const [dPhone, setDPhone] = useState("");
	const [dNif, setDNif] = useState("");
	const [dDriverLicense, setDDriverLicense] = useState(null);
	const [dInsurance, setDInsurance] = useState(null);

	// company form state
	const [cName, setCName] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [address, setAddress] = useState("");
	const [cEmail, setCEmail] = useState("");
	const [cPassword, setCPassword] = useState("");
	const [cPhone, setCPhone] = useState("");
	const [cNif, setCNif] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const abortRef = useRef(null);
	const navigate = useNavigate();
    const [toast, setToast] = useState(null);

	useEffect(() => {
		return () => abortRef.current?.abort();
	}, []);

	// Prevent body scroll while register page is visible and hide global navbar
	useEffect(() => {
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.body.classList.add("no-header");

		return () => {
			document.body.style.overflow = prevOverflow;
			document.body.classList.remove("no-header");
		};
	}, []);

	const resetErrors = () => setError(null);

	const submitDriver = async () => {
		resetErrors();
		if (!dName || !dEmail || !dPassword || !dPhone || !dNif) {
			setError("Preenche todos os campos obrigatórios.");
			return;
		}
		if (!dDriverLicense || !dInsurance) {
			setError("Carrega a imagem da carta de condução e do seguro.");
			return;
		}

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		const form = new FormData();
		form.append("Name", dName);
		form.append("Email", dEmail);
		form.append("Password", dPassword);
		form.append("PhoneNumber", dPhone);
		form.append("Nif", dNif);
		form.append("DriverLicense", dDriverLicense);
		// backend expects the field named "Insurance" (validation error showed this key)
		form.append("Insurance", dInsurance);

		setLoading(true);
		try {
			const res = await api.post("/register/driver", form, {
				signal: controller.signal,
			});
			const { token } = res.data || {};
			if (token) localStorage.setItem("token", token);
			navigate("/login");
		} catch (err) {
			if (err.name === "CanceledError") return;
			if (err.response) {
				const msg = err.response.data?.message || `Erro ${err.response.status}`;
				setError(msg);
			} else if (err.request) {
				setError("Falha de rede: sem resposta do servidor.");
			} else {
				setError(`Erro: ${err.message}`);
			}
		} finally {
			setLoading(false);
		}
	};

	const submitCompany = async () => {
		resetErrors();
		if (!cName || !companyName || !address || !cEmail || !cPassword || !cPhone || !cNif) {
			setError("Preenche todos os campos obrigatórios.");
			return;
		}

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		const payload = {
			name: cName,
			companyName,
			address,
			email: cEmail,
			password: cPassword,
			phoneNumber: cPhone,
			nif: cNif,
		};

		setLoading(true);
		try {
			const res = await api.post("/register/company", payload, {
				signal: controller.signal,
			});
			const { token } = res.data || {};
			if (token) localStorage.setItem("token", token);
			navigate("/login");
		} catch (err) {
			if (err.name === "CanceledError") return;
			let msg = getApiErrorMessage(err);
			if (!msg) {
				if (err.response) msg = err.response.data?.message || `Erro ${err.response.status}`;
				else if (err.request) msg = "Falha de rede: sem resposta do servidor.";
				else msg = `Erro: ${err.message}`;
			}
			setToast({ type: "error", msg });
		} finally {
			setLoading(false);
			setTimeout(() => setToast(null), 3000);
		}
            };

	return (
		<div className="login-page">
			<img src={logo} alt="Bid&Go logo" className="page-logo" />
			<div className="login-container">
				<div className="login-form">
					<h2 className="login-title">Criar Conta</h2>

					{!mode && (
						<div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
							<button
								type="button"
								className="login-button"
								onClick={() => setMode("driver")}
							>
								Criar conta Driver
							</button>

							<button
								type="button"
								className="login-button"
								onClick={() => setMode("company")}
							>
								Criar conta Company
							</button>
						</div>
					)}

					{mode === "driver" && (
						<form onSubmit={(e) => e.preventDefault()}>
							<label className="login-label">
								Nome
								<input value={dName} onChange={(e) => setDName(e.target.value)} />
							</label>

							<label className="login-label">
								Carta de Condução (imagem)
								<input type="file" accept="image/*" onChange={(e) => setDDriverLicense(e.target.files[0])} />
							</label>

							<label className="login-label">
								Seguro (imagem)
								<input type="file" accept="image/*" onChange={(e) => setDInsurance(e.target.files[0])} />
							</label>

							<label className="login-label">
								Email
								<input type="email" value={dEmail} onChange={(e) => setDEmail(e.target.value)} />
							</label>

							<PasswordInput label="Palavra-passe" value={dPassword} onChange={(e) => setDPassword(e.target.value)} />

							<label className="login-label">
								Telefone
								<input value={dPhone} onChange={(e) => setDPhone(e.target.value)} />
							</label>

							<label className="login-label">
								NIF
								<input value={dNif} onChange={(e) => setDNif(e.target.value)} />
							</label>

							{error && <p className="error-message">{error}</p>}

							<div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
								<button type="button" className="login-button" onClick={submitDriver} disabled={loading}>
									{loading ? 'A processar…' : 'Enviar registo Driver'}
								</button>
								<button type="button" className="login-button" onClick={() => setMode(null)} disabled={loading}>
									Voltar
								</button>
							</div>
						</form>
					)}

					{mode === "company" && (
						<form onSubmit={(e) => e.preventDefault()}>
							<label className="login-label">
								Nome
								<input value={cName} onChange={(e) => setCName(e.target.value)} />
							</label>

							<label className="login-label">
								Company Name
								<input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
							</label>

							<label className="login-label">
								Morada
								<input value={address} onChange={(e) => setAddress(e.target.value)} />
							</label>

							<label className="login-label">
								Email
								<input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} />
							</label>

							<PasswordInput label="Palavra-passe" value={cPassword} onChange={(e) => setCPassword(e.target.value)} />

							<label className="login-label">
								Telefone
								<input value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
							</label>

							<label className="login-label">
								NIF
								<input value={cNif} onChange={(e) => setCNif(e.target.value)} />
							</label>

							{error && <p className="error-message">{error}</p>}

							<div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
								<button type="button" className="login-button" onClick={submitCompany} disabled={loading}>
									{loading ? 'A processar…' : 'Enviar registo Company'}
								</button>
								<button type="button" className="login-button" onClick={() => setMode(null)} disabled={loading}>
									Voltar
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
             {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.msg}
                </div>
            )}
		</div>
	);

    
}

export default RegisterPage;

