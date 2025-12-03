/**
 * Result object returned by {@link useLogin}.
 *
 * @typedef {Object} UseLoginResult
 * @property {function(string, string): Promise<any>} login -
 *   Function that triggers the login flow.
 * @property {boolean} loading - Indicates whether a login request is in progress.
 * @property {string|null} error - Error message when login fails; null when there is no error.
 */

import { useRef, useState, useEffect } from "react";
import { login as loginRequest } from "../services/authService";

/**
 * React hook that encapsulates the login flow with cancellation support.
 *
 * It manages loading and error state and uses an {@link AbortController}
 * to cancel any in-flight login request when a new one starts or the
 * component using the hook unmounts.
 *
 * @returns {UseLoginResult} Object containing the login action and its state.
 */
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
