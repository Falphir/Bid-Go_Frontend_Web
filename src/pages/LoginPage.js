import React, { useRef, useState, useEffect } from "react";
import "../styles/LoginPage.css";
import { useNavigate } from "react-router";
import api from "../api/axiosConfig";
import logo from "../assets/logo.png";
import PasswordInput from "../components/PasswordInput";


function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [remember, setRemember] = useState(true);
    const abortRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // cleanup ao desmontar
        return () => abortRef.current?.abort();
    }, []);

    // Impede scroll no body enquanto a página de login estiver visível
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Preenche email e password.");
            return;
        }

        // cancela pedido anterior (se existir)
        abortRef.current?.abort();

        // cria novo controller e guarda no ref
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await api.post(
                "/auth/login",
                { email, password },
                { signal: controller.signal }
            );

            const { token, user } = res.data || {};
            if (remember && token) localStorage.setItem("token", token);
            navigate("/");
        } catch (err) {
            if (err.name === "CanceledError") return;
            if (err.response) {
                const msg =
                    err.response.data?.message ||
                    `Erro ${err.response.status}: ${err.response.statusText}`;
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

    return (
        <div className="login-page">
            <img src={logo} alt="Bid&Go logo" className="page-logo" />
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2 className="login-title">Iniciar Sessão</h2>

                    <label className="login-label">
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </label>

                    <PasswordInput
                        label="Palavra-passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <label className="login-remember" htmlFor="remember">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <span className="remember-text">Manter sessão iniciada</span>
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "A entrar…" : "Entrar"}
                    </button>

                    <a href="#forgot" className="forgot-password">
                        Esqueceu-se da palavra-passe?
                    </a>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;