import { useEffect, useState } from "react";
import { getBidsByDriver } from "../services/bidsService";

/**
 * Result object returned by {@link useMyBids}.
 *
 * @typedef {Object} UseMyBidsResult
 * @property {Object[]} bids - List of bids created by the driver.
 * @property {boolean} loading - Indicates whether the bids are being loaded.
 * @property {string|null} error - Error message when loading fails; null otherwise.
 */

/**
 * React hook that loads the bids associated with the current driver.
 *
 * It calls {@link getBidsByDriver} whenever the provided `userId` changes
 * and exposes the resulting list along with loading and error state.
 *
 * @param {Object} [options] - Hook options containing the driver identifier.
 * @param {(string|number)} [options.userId] - Identifier of the driver whose bids will be loaded.
 * @returns {UseMyBidsResult} Bids, loading and error metadata.
 */
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
          err?.message || "Unable to load bids."
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
