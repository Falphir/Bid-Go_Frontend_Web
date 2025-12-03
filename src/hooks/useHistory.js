import { useEffect, useState } from "react";
import {
  getDriverHistory,
  getCompanyHistory,
} from "../services/historyService";

/**
 * Result object returned by {@link useHistory}.
 *
 * @typedef {Object} UseHistoryResult
 * @property {Object[]} items - Normalized history entries sorted by newest first.
 * @property {boolean} loading - Indicates whether history data is being loaded.
 * @property {string|null} error - Error message when loading fails; null otherwise.
 */

/**
 * React hook that loads historical data for either a driver or a company.
 *
 * It uses {@link getDriverHistory} when `isDriver` is true and
 * {@link getCompanyHistory} when `isCompany` is true, normalizing and
 * sorting entries by most recent date.
 *
 * @param {Object} [options] - Options specifying the user id and role.
 * @param {(string|number)} [options.userId] - Identifier of the user whose history will be loaded.
 * @param {boolean} [options.isDriver] - Whether the current user is a driver.
 * @param {boolean} [options.isCompany] - Whether the current user is a company.
 * @returns {UseHistoryResult} History items and related loading/error state.
 */
export function useHistory({ userId, isDriver, isCompany } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sortByNewest = (arr) => {
    return [...arr].sort((a, b) => (b?.dateTime ?? 0) - (a?.dateTime ?? 0));
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        if (isDriver) {
          const data = await getDriverHistory(userId, controller.signal);
          setItems(sortByNewest(data));
        } else if (isCompany) {
          const data = await getCompanyHistory(userId, controller.signal);
          setItems(sortByNewest(data));
        } else {
          setItems([]);
        }
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load history."
        );
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
