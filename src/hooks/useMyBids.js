import { useEffect, useState } from "react";
import { getBidsByDriver } from "../services/bidsService";

// Hook das minhas bids (driver)

export function useMyBids({ userId } = {}) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getBidsByDriver(userId, controller.signal);
        setBids(data || []);
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError(
          err?.response?.data?.message || err?.message || "Unable to load bids."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId]);

  return { bids, loading, error };
}

export default useMyBids;
