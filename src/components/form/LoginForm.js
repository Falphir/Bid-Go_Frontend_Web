/**
 * @typedef {Object} LoginFormProps
 * @property {string} email
 * @property {string} password
 * @property {boolean} remember
 * @property {boolean} loading
 * @property {function(string): void} onChangeEmail
 * @property {function(string): void} onChangePassword
 * @property {function(boolean): void} onToggleRemember
 * @property {function(Event): void} onSubmit
 */

import React from "react";
import PasswordInput from "../PasswordInput/PasswordInput";
import "./LoginForm.css";
import { useNavigate } from "react-router";


/**
 * Login form component used on the authentication page.
 *
 * It delegates all state handling and submission logic to the parent
 * via callbacks, and provides a shortcut link to the password
 * recovery page using React Router.
 *
 * @param {LoginFormProps} props - Login values and handlers.
 * @returns {JSX.Element} Rendered login form.
 */
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
