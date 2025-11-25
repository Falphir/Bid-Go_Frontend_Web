import React, { useRef, useState, useEffect } from "react";
import "../styles/LoginPage.css";
import { useNavigate, useLocation } from "react-router";
import api from "../api/axiosConfig";
import logo from "../assets/logo.png";
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
    const { showToast } = useToast();

    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    useEffect(() => {
        if (location?.state?.toast) {
            const t = location.state.toast;
            showToast(t.msg, t.type);
        }
    }, [location, showToast]);

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
            setError("Fill in email and password.");
            return;
        }

        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await api.post(
                "/auth/login",
                { email, password },
                { signal: controller.signal }
            );

            const { token} = res.data || {};
            if (remember && token) localStorage.setItem("token", token);
            navigate("/");
        } catch (err) {
            if (err.name === "CanceledError") return;
            if (err.response) {
                const msg =
                    err.response.data?.message ||
                    `Error ${err.response.status}: ${err.response.statusText}`;
                setError(msg);
                showToast(msg, "error");
            } else if (err.request) {
                const msg = "Network failure: no response from server.";
                setError(msg);
                showToast(msg, "error");
            } else {
                const msg = `Error: ${err.message}`;
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
                <div className="login-box">
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

                    <div className="login-register">
                        <span className="login-register-text">Don’t have an account?</span>
                        <button
                            className="login-register-link"
                            onClick={() => navigate("/register")}
                        >
                            Register here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
