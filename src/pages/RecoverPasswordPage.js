import React, { useState, useRef, useEffect } from "react";
import "../styles/LoginPage.css";
import api from "../api/axiosConfig";
import { getApiErrorMessage } from "../utils/httpError";
import { useToast } from "../components/feedback/ToastContext";
import StatusMessage from "../components/feedback/StatusMessage";
import { useNavigate } from "react-router";
import PasswordInput from "../components/PasswordInput/PasswordInput";

function RecoverPasswordPage() {
    const [mode, setMode] = useState("request");
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);
    const abortRef = useRef(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    const handleRequest = async (e) => {
        e.preventDefault();
        setError(null);
        if (!email) {
            showToast("Enter your email to recover your password.", "error");
            return;
        }
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        try {

            await api.post(
                "/auth/recover-password",
                { email },
                { signal: controller.signal }
            );
            setSent(true);
            showToast("If the email exists, instructions have been sent.", "success");
            setMode("reset");
        } catch (err) {
            if (err.name === "CanceledError") return;
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg, "error");
            setError(apiMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError(null);
        if (!token || !password) {
            showToast("Fill out the token and the new password.", "error");
            return;
        }
        if (password !== confirm) {
            showToast("Passwords do not match.", "error");
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        try {
            const res = await api.post(
                "/auth/reset-password",
                { token, newPassword: password },
                { signal: controller.signal }
            );

            showToast(
                res?.data?.message || "Password updated successfully.",
                "success"
            );
            setTimeout(() => navigate("/Login"), 800);
        } catch (err) {
            if (err.name === "CanceledError") return;
            const apiMsg = getApiErrorMessage(err);
            showToast(apiMsg, "error");
            setError(apiMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {mode === "request" && (
                    <form className="login-form" onSubmit={handleRequest}>
                        <h2 className="login-title">Recover Password</h2>
                        <label className="login-label">
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email used in the account"
                                autoComplete="email"
                                required
                            />
                        </label>
                        {error && <StatusMessage type="error">{error}</StatusMessage>}
                        {sent && (
                            <StatusMessage type="success">
                                Instructions sent to your email.
                            </StatusMessage>
                        )}
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? "Processing…" : "Send Instructions"}
                        </button>
                        <div style={{ marginTop: 12 }}>
                            <a
                                href="#reset"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMode("reset");
                                }}
                            >
                                Already have a token? Reset now
                            </a>
                        </div>
                    </form>
                )}

                {mode === "reset" && (
                    <form className="login-form" onSubmit={handleReset}>
                        <h2 className="login-title">Reset Password</h2>
                        <label className="login-label">
                            Token (copied from email)
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Token received by email"
                                required
                            />
                        </label>

                        <PasswordInput
                            label="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <PasswordInput
                            label="Confirm New Password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? "Processing…" : "Reset Password"}
                        </button>

                        <div style={{ marginTop: 12 }}>
                            <a
                                href="#request"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMode("request");
                                }}
                            >
                                Send recovery email again
                            </a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default RecoverPasswordPage;
