import React, { useState, useEffect } from "react";
import "../styles/LoginPage.css";
import { useNavigate, useLocation } from "react-router";
import logo from "../assets/logo.png";
import LoginForm from "../components/form/LoginForm";
import { useToast } from "../components/feedback/ToastContext";
import useLogin from "../hooks/useLogin";

// Página de autenticação (login)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Preencha email e password.", "error");
      return;
    }
    try {
      const res = await login(email, password);
      const { token } = res || {};
      if (remember && token) localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      if (err?.name === "CanceledError") return;
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";

      showToast(msg, "error");
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
