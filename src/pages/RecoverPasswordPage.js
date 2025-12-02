import React, { useState } from "react";
import "../styles/LoginPage.css";
import { getApiErrorMessage } from "../utils/httpError";
import { useToast } from "../components/feedback/ToastContext";
import { useNavigate } from "react-router";
import PasswordInput from "../components/PasswordInput/PasswordInput";
import useRecoverPassword from "../hooks/useRecoverPassword";

// Página recuperar/reset da palavra‑passe
function RecoverPasswordPage() {
  const [mode, setMode] = useState("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { request, reset, loading } = useRecoverPassword();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast("Enter your email to recover your password.", "error");
      return;
    }
    try {
      await request(email);
      showToast("If the email exists, instructions have been sent.", "success");
      setMode("reset");
    } catch (err) {
      if (err?.name === "CanceledError") return;
      const apiMsg = getApiErrorMessage(err);
      showToast(apiMsg, "error");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token || !password) {
      showToast("Fill out the token and the new password.", "error");
      return;
    }
    if (password !== confirm) {
      showToast("Passwords do not match.", "error");
      return;
    }
    try {
      const res = await reset(token, password);
      showToast(res?.message || "Password updated successfully.", "success");
      setTimeout(() => navigate("/Login"), 800);
    } catch (err) {
      if (err?.name === "CanceledError") return;
      const apiMsg = getApiErrorMessage(err);
      showToast(apiMsg, "error");
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
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Processing…" : "Send Instructions"}
            </button>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#1d4ed8",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => setMode("reset")}
              >
                Already have a token? Reset now
              </button>
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
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#1d4ed8",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => setMode("request")}
              >
                Send recovery email again
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RecoverPasswordPage;
