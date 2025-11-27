import { useEffect, useState } from "react";
import { getDriverHistory, getCompanyHistory } from "../services/historyService";

export function useHistory({ userId, isDriver, isCompany } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        if (isDriver) {
          const data = await getDriverHistory(userId, controller.signal);
          setItems(data);
        } else if (isCompany) {
          const data = await getCompanyHistory(userId, controller.signal);
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError(err?.response?.data?.message || err?.message || "Unable to load history.");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId, isDriver, isCompany]);

  return { items, loading, error };
}

export default useHistory;
