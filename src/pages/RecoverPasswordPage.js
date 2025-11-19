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

  // RULES
  const pwRules = {
    minLength: { ok: password.length >= 8, label: "Pelo menos 8 caracteres" },
    upper: { ok: /[A-Z]/.test(password), label: "Uma letra maiúscula" },
    lower: { ok: /[a-z]/.test(password), label: "Uma letra minúscula" },
    number: { ok: /[0-9]/.test(password), label: "Um número" },
    special: { ok: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: "Um carácter especial" },
  };
  const isPasswordStrong = Object.values(pwRules).every((r) => r.ok);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Preencha o email para recuperar a palavra-passe.");
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
      showToast("Se o email existir, instruções foram enviadas.", "success");
      setMode("reset");
    } catch (err) {
      if (err.name === "CanceledError") return;
      const apiMsg = getApiErrorMessage(err);
      setError(apiMsg);
      showToast(apiMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token || !password) {
      setError("Preencha o token e a nova palavra-passe.");
      return;
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    if (!isPasswordStrong) {
      setError("A palavra-passe não cumpre os requisitos obrigatórios.");
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

      showToast(res?.data?.message || "Palavra-passe atualizada com sucesso.", "success");
      setTimeout(() => navigate("/Login"), 800);
    } catch (err) {
      if (err.name === "CanceledError") return;
      const apiMsg = getApiErrorMessage(err);
      setError(apiMsg);
      showToast(apiMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <StatusMessage type="loading">A processar…</StatusMessage>;

  return (
    <div className="login-page">
      <div className="login-container">
        {mode === "request" && (
          <form className="login-form" onSubmit={handleRequest}>
            <h2 className="login-title">Recuperar Palavra-passe</h2>
            <label className="login-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email usado na conta"
                autoComplete="email"
                required
              />
            </label>
            {error && <StatusMessage type="error">{error}</StatusMessage>}
            {sent && (
              <StatusMessage type="success">Instruções enviadas para o seu email.</StatusMessage>
            )}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "A processar…" : "Enviar Instruções"}
            </button>
            <div style={{ marginTop: 12 }}>
              <a
                href="#reset"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("reset");
                }}
              >
                Já tem um token? Redefinir agora
              </a>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form className="login-form" onSubmit={handleReset}>
            <h2 className="login-title">Redefinir Palavra-passe</h2>
            <label className="login-label">
              Token (copiado do email)
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token recebido por email"
                required
              />
            </label>

            <PasswordInput
              label="Nova Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <PasswordInput
              label="Confirmar Nova Palavra-passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <strong>Requisitos da palavra-passe:</strong>
              <ul style={{ marginTop: 6, marginLeft: 18 }}>
                {Object.keys(pwRules).map((k) => (
                  <li key={k} style={{ color: pwRules[k].ok ? "#0a7f3a" : "#b02a37" }}>
                    {pwRules[k].ok ? "✓" : "✗"} {pwRules[k].label}
                  </li>
                ))}
              </ul>
            </div>

            {error && <StatusMessage type="error">{error}</StatusMessage>}

            <button type="submit" className="login-button" disabled={loading || !isPasswordStrong}>
              {loading ? "A processar…" : "Redefinir Palavra-passe"}
            </button>

            {error && <StatusMessage type="error">{error}</StatusMessage>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "A processar…" : "Redefinir Palavra-passe"}
            </button>

            <div style={{ marginTop: 12 }}>
              <a
                href="#request"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("request");
                }}
              >
                Enviar novo email de recuperação
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RecoverPasswordPage;
