import { useRef, useState, useEffect } from "react";
import { registerDriver, registerCompany } from "../services/authService";

/**
 * Result object returned by {@link useRegister}.
 *
 * @typedef {Object} UseRegisterResult
 * @property {function(FormData): Promise<*>} submitDriver - Submits a new driver registration.
 * @property {function(Object): Promise<*>} submitCompany - Submits a new company registration.
 * @property {boolean} loading - Indicates whether a registration request is in progress.
 * @property {string|null} error - Error message when registration fails; null otherwise.
 */


/**
 * React hook that wraps driver and company registration calls.
 *
 * It manages an internal `AbortController` and exposes two helpers
 * (`submitDriver` and `submitCompany`) together with `loading` and
 * `error` flags.
 *
 * @returns {UseRegisterResult} Registration helpers and state.
 */
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
