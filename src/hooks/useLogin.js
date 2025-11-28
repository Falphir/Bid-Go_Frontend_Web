import { useRef, useState, useEffect } from "react";
import { login as loginRequest } from "../services/authService";

export function useLogin() {
  const abortRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function login(email, password) {
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const data = await loginRequest(email, password, controller.signal);
      return data;
    } catch (err) {
      if (err?.name === "CanceledError") return null;
      setError(err?.response?.data?.message || err?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}

export default useLogin;
