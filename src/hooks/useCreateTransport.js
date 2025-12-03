import { useRef, useState, useEffect } from "react";
import {
  createTransportJson,
  createTransportForm,
  createDraftJson,
  createDraftForm,
} from "../services/transportsService";

/**
 * Result object returned by {@link useCreateTransport}.
 *
 * @typedef {Object} UseCreateTransportResult
 * @property {function(Object): Promise<*>} createTransport - Creates a new transport or draft based on the given options.
 * @property {function(Object): Promise<*>} createDraft - Creates a new draft transport based on the given options.
 * @property {boolean} loading - Indicates whether a create/draft request is in progress.
 */


/**
 * React hook that wraps the transport and draft creation operations.
 *
 * It exposes two async helpers, `createTransport` and `createDraft`,
 * both of which accept an options object with `isForm` and `payload`
 * and automatically manage an `AbortController` and a shared `loading`
 * flag.
 *
 * @returns {UseCreateTransportResult} Helper functions and loading flag.
 */
export function useCreateTransport() {
  const abortRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function createTransport({ isForm = false, payload }) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      if (isForm) {
        return await createTransportForm(payload, controller.signal);
      }
      return await createTransportJson(payload, controller.signal);
    } finally {
      setLoading(false);
    }
  }

  async function createDraft({ isForm = false, payload }) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      if (isForm) {
        return await createDraftForm(payload, controller.signal);
      }
      return await createDraftJson(payload, controller.signal);
    } finally {
      setLoading(false);
    }
  }

  return { createTransport, createDraft, loading };
}

export default useCreateTransport;
