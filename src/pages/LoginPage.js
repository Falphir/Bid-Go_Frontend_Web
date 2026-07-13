import React, { useState, useEffect } from "react";
import "../styles/LoginPage.css";
import { useNavigate, useLocation } from "react-router";
import logo from "../assets/logo.png";
import LoginForm from "../components/form/LoginForm";
import DemoLogin from "../components/form/DemoLogin";
import { useToast } from "../components/feedback/ToastContext";
import useLogin from "../hooks/useLogin";

const isDemo = process.env.REACT_APP_DEMO_MODE === "true";

/**
 * Login page for the Bid-Go web application.
 *
 * It renders the main login form, handles form state, triggers the
 * {@link useLogin} hook to authenticate the user and, on success,
 * stores the token (if the user chose to be remembered) and navigates
 * to the main application route.
 *
 * The page also listens to navigation state to show toasts when coming
 * from other pages (for example after registration or password reset).
 *
 * @returns {JSX.Element} Rendered login page component.
 */

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { login, loading } = useLogin();

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

  // Shared by the form and the demo buttons. The demo path passes its credentials in
  // directly rather than going through state, which would not have flushed yet.
  const signIn = async (emailToUse, passwordToUse) => {
    try {
      const res = await login(emailToUse, passwordToUse);
      const { token } = res || {};
      if (remember && token) localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      if (err?.name === "CanceledError") return;
      showToast(err?.message || "Login failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Preencha email e password.", "error");
      return;
    }
    await signIn(email, password);
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await signIn(demoEmail, demoPassword);
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
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onToggleRemember={setRemember}
            onSubmit={handleSubmit}
          />

          {isDemo && (
            <DemoLogin onDemoLogin={handleDemoLogin} loading={loading} />
          )}

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
