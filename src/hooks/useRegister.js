import { useRef, useState, useEffect } from "react";
import { registerDriver, registerCompany } from "../services/authService";

// Hook de registo (motorista/empresa)

export function useRegister() {
  const abortRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function submitDriver(formData) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await registerDriver(formData, controller.signal);
      return res;
    } catch (err) {
      if (err?.name === "CanceledError") return null;
      setError(
        err?.response?.data?.message || err?.message || "Registration failed"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function submitCompany(payload) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await registerCompany(payload, controller.signal);
      return res;
    } catch (err) {
      if (err?.name === "CanceledError") return null;
      setError(
        err?.response?.data?.message || err?.message || "Registration failed"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { submitDriver, submitCompany, loading, error };
}

export default useRegister;
