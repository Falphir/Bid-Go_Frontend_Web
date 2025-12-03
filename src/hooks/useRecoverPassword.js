import { useRef, useState, useEffect } from "react";
import { recoverPassword, resetPassword } from "../services/authService";

/**
 * Result object returned by {@link useRecoverPassword}.
 *
 * @typedef {Object} UseRecoverPasswordResult
 * @property {function(string): Promise<*>} request - Starts the password recovery flow by email.
 * @property {function(string, string): Promise<*>} reset - Resets the password using a token and new password.
 * @property {boolean} loading - Indicates whether a recover/reset request is in progress.
 * @property {string|null} error - Error message when an operation fails; null otherwise.
 * @property {boolean} sent - True once a recovery email has been successfully requested.
 */


/**
 * React hook that encapsulates the password recovery and reset flows.
 *
 * It exposes two main actions: `request`, which triggers the recovery
 * email sending, and `reset`, which applies a new password using a
 * previously issued token.
 *
 * @returns {UseRecoverPasswordResult} Recovery actions and related state.
 */
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
      setError(
        err?.response?.data?.message || err?.message || "Recover failed"
      );
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
