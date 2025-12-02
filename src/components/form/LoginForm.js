import React from "react";
import PasswordInput from "../PasswordInput/PasswordInput";
import "./LoginForm.css";
import { useNavigate } from "react-router";

// Form login
function LoginForm({
  email,
  password,
  remember,
  loading,
  onChangeEmail,
  onChangePassword,
  onToggleRemember,
  onSubmit,
}) {
  const navigate = useNavigate();
  return (
    <form className="login-form" onSubmit={onSubmit}>
      <h2 className="login-title">Sign In</h2>
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
        label="Password"
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
        <span className="remember-text">Keep me signed in</span>
      </label>
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <a
        href="/recover"
        className="forgot-password"
        onClick={(e) => {
          e.preventDefault();
          navigate("/recover");
        }}
      >
        Forgot your password?
      </a>
    </form>
  );
}

export default LoginForm;
