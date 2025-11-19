import React from "react";
import PasswordInput from "../PasswordInput/PasswordInput";
import StatusMessage from "../feedback/StatusMessage";
import "./LoginForm.css";

function LoginForm({ email, password, remember, loading, error, onChangeEmail, onChangePassword, onToggleRemember, onSubmit }) {
    return (
        <form className="login-form" onSubmit={onSubmit}>
            <h2 className="login-title">Iniciar Sessão</h2>
            <label className="login-label">
                Email
                <input
                    type="email"
                    value={email}
                    onChange={(e) => onChangeEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    required
                />
            </label>
            <PasswordInput
                label="Palavra-passe"
                value={password}
                onChange={(e) => onChangePassword(e.target.value)}
                autoComplete="current-password"
                required
            />
            <label className="login-remember" htmlFor="remember">
                <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => onToggleRemember(e.target.checked)}
                />
                <span className="remember-text">Manter sessão iniciada</span>
            </label>
            {error && <StatusMessage type="error">{error}</StatusMessage>}
            <button type="submit" className="login-button" disabled={loading}>
                {loading ? "A entrar…" : "Entrar"}
            </button>
            <a href="#forgot" className="forgot-password">Esqueceu-se da palavra-passe?</a>
        </form>
    );
}

export default LoginForm;
