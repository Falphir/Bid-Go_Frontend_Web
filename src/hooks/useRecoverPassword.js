import { useRef, useState, useEffect } from "react";
import { recoverPassword, resetPassword } from "../services/authService";

export function useRecoverPassword() {
  const abortRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function request(email) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await recoverPassword(email, controller.signal);
      setSent(true);
      return res;
    } catch (err) {
      if (err?.name === "CanceledError") return null;
      setError(err?.response?.data?.message || err?.message || "Recover failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function reset(token, newPassword) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await resetPassword(token, newPassword, controller.signal);
      return res;
    } catch (err) {
      if (err?.name === "CanceledError") return null;
      setError(err?.response?.data?.message || err?.message || "Reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { request, reset, loading, error, sent };
}

export default useRecoverPassword;
