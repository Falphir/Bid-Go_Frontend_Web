import React from "react";
import "./DemoLogin.css";

/**
 * One-click sign-in panel for the public demo.
 *
 * Rendered only when REACT_APP_DEMO_MODE is "true", so it never appears in local
 * development or a real deployment. The accounts it signs in as are created by the
 * backend's demo seeder; the credentials are intentionally public.
 *
 * @param {Object} props
 * @param {function(string, string): void} props.onDemoLogin - Called with (email, password).
 * @param {boolean} props.loading - Disables the buttons while a sign-in is in flight.
 * @returns {JSX.Element} Rendered demo sign-in panel.
 */
function DemoLogin({ onDemoLogin, loading }) {
  const password = "demo1234";

  return (
    <div className="demo-login">
      <div className="demo-login-header">
        <span className="demo-login-badge">Demo</span>
        <p className="demo-login-text">
          This is a live demo. Sign in with a sample account — no registration needed.
        </p>
      </div>

      <div className="demo-login-buttons">
        <button
          type="button"
          className="demo-login-button"
          disabled={loading}
          onClick={() => onDemoLogin("demo.company@bidgo.app", password)}
        >
          Sign in as Company
        </button>
        <button
          type="button"
          className="demo-login-button"
          disabled={loading}
          onClick={() => onDemoLogin("demo.driver@bidgo.app", password)}
        >
          Sign in as Driver
        </button>
      </div>

      <p className="demo-login-hint">
        A company posts transport requests; a driver bids on them.
      </p>
    </div>
  );
}

export default DemoLogin;
