import React, { useRef, useState, useEffect } from "react";
import "../styles/LoginPage.css";
import { useNavigate, useLocation } from "react-router";
import api from "../api/axiosConfig";
import logo from "../assets/logo.png";
import PasswordInput from "../components/PasswordInput/PasswordInput"; // kept for reused component dependency
import StatusMessage from "../components/feedback/StatusMessage"; // legacy inline removal now replaced by LoginForm
import LoginForm from "../components/form/LoginForm";
import { useToast } from "../components/feedback/ToastContext";


function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [remember, setRemember] = useState(true);
    const abortRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast, toasts } = useToast();

    useEffect(() => {
        // cleanup ao desmontar
        return () => abortRef.current?.abort();
    }, []);

    // show toast passed via navigation state (e.g. after successful register)
    useEffect(() => {
        if (location?.state?.toast) {
            const t = location.state.toast;
            showToast(t.msg, t.type);
        }
    }, [location]);

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
                showToast(msg, "error");
            } else if (err.request) {
                const msg = "Falha de rede: sem resposta do servidor.";
                setError(msg);
                showToast(msg, "error");
            } else {
                const msg = `Erro: ${err.message}`;
                setError(msg);
                showToast(msg, "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <img src={logo} alt="Bid&Go logo" className="page-logo" />
            <div className="login-container">
                <LoginForm
                    email={email}
                    password={password}
                    remember={remember}
                    loading={loading}
                    error={error}
                    onChangeEmail={setEmail}
                    onChangePassword={setPassword}
                    onToggleRemember={setRemember}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}

export default LoginPage;