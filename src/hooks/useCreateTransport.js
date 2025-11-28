import { useRef, useState, useEffect } from "react";
import {
  createTransportJson,
  createTransportForm,
  createDraftJson,
  createDraftForm,
} from "../services/transportsService";

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
