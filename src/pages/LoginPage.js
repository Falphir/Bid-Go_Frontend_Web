import React, { useRef, useState, useEffect } from 'react';
import './LoginPage.css';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remember, setRemember] = useState(true);

  const abortRef = useRef(null);

  useEffect(() => {
    // cleanup ao desmontar
    return () => abortRef.current?.abort();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Preenche email e password.');
      return;
    }

    // cancela pedido anterior (se existir)
    abortRef.current?.abort();

    // cria novo controller e guarda no ref
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await axios.post(
          'https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/auth/login',
          { email, password },
          {
            signal: controller.signal,            // <- usa o controller local
            headers: { 'Content-Type': 'application/json' },
          }
      );

      const { token, user } = res.data || {};
      if (remember && token) localStorage.setItem('access_token', token);
      // TODO: navegar para a área autenticada, ex.: navigate('/dashboard')
    } catch (err) {
      if (err.name === 'CanceledError') return;
      if (err.response) {
        const msg =
            err.response.data?.message ||
            `Erro ${err.response.status}: ${err.response.statusText}`;
        setError(msg);
      } else if (err.request) {
        setError('Falha de rede: sem resposta do servidor.');
      } else {
        setError(`Erro: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Iniciar Sessão</h2>

          <label className="login-label">
            Email
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="introduza o seu email"
                autoComplete="email"
                required
            />
          </label>

          <label className="login-label">
            Palavra-passe
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
            />
          </label>

          <label className="login-remember">
            <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
            />
            Manter sessão
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>

          <a href="#forgot" className="forgot-password">Esqueceu-se da palavra-passe?</a>
        </form>
      </div>
  );
}

export default LoginPage;
