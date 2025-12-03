/**
 * Options accepted by {@link useTransports}.
 *
 * @typedef {Object} UseTransportsOptions
 * @property {string|number} [userId] - Identifier of the current user.
 * @property {boolean} [isDriver] - Whether the current user is a driver.
 * @property {boolean} [isCompany] - Whether the current user is a company.
 * @property {Object} [initialFilters] - Initial filters applied when fetching driver transports.
 */

/**
 * Result object returned by {@link useTransports}.
 *
 * @typedef {Object} UseTransportsResult
 * @property {Object[]} requests - Normalized list of transport requests.
 * @property {boolean} isRequestsEmpty - True when there are no requests to show.
 * @property {boolean} loading - Indicates whether a fetch operation is in progress.
 * @property {string|null} error - Error message when loading fails; null otherwise.
 * @property {Object} filters - Current filters used when fetching driver transports.
 * @property {boolean} showFilters - Whether the filters panel is currently visible.
 * @property {function(boolean)} setShowFilters - Setter for the `showFilters` flag.
 * @property {function(Object)} setFilters - Setter for the current filters.
 * @property {function(Object)} applyFilters - Applies new filters and triggers a fetch.
 * @property {function(Object)} clearFilters - Clears filters and refreshes the list.
 */

/**
 * React hook that loads and manages transport requests for drivers and companies.
 *
 * When `isCompany` is true it fetches company transports, and when `isDriver`
 * is true it fetches driver-visible transports, optionally filtered by origin,
 * destination and other criteria.
 *
 * @param {UseTransportsOptions} [options] - Configuration options for the hook.
 * @returns {UseTransportsResult} Object containing transport data, loading state and helpers.
 */
import { useCallback, useEffect, useState } from "react";
import {
  getCompanyTransports,
  getDriverTransports,
} from "../services/transportsService";

export function useTransports({
  userId,
  isDriver,
  isCompany,
  initialFilters = {},
} = {}) {
  const [requests, setRequests] = useState([]);
  const [isRequestsEmpty, setIsRequestsEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const fetchForCompany = useCallback(
    async (signal) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      setIsRequestsEmpty(false);
      try {
        const normalized = await getCompanyTransports(userId, signal);
        const sorted = sortByNewest(normalized);
        setRequests(sorted);
        if (normalized.length === 0) setIsRequestsEmpty(true);
      } catch (err) {
        if (err.name === "CanceledError") return;
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchForDriver = useCallback(
    async (signal, currentFilters) => {
      setLoading(true);
      setError(null);
      setIsRequestsEmpty(false);
      try {
        const normalized = await getDriverTransports(
          currentFilters || filters,
          signal
        );
        const sorted = sortByNewest(normalized);
        setRequests(sorted);
        if (normalized.length === 0) setIsRequestsEmpty(true);
      } catch (err) {
        if (err.name === "CanceledError") return;
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const controller = new AbortController();

    if (isCompany && userId) {
      fetchForCompany(controller.signal);
    } else if (isDriver) {
      fetchForDriver(controller.signal, filters);
    }

    return () => controller.abort();
  }, [isDriver, isCompany, userId, filters, fetchForCompany, fetchForDriver]);

  function applyFilters(f) {
    setFilters(f);
    const controller = new AbortController();
    fetchForDriver(controller.signal, f);
    setTimeout(() => controller.abort(), 30000);
  }

  function clearFilters(cleared) {
    setFilters(cleared);
    const controller = new AbortController();
    fetchForDriver(controller.signal, cleared);
    setTimeout(() => controller.abort(), 30000);
  }

  return {
    requests,
    isRequestsEmpty,
    loading,
    error,
    filters,
    showFilters,
    setShowFilters,
    setFilters,
    applyFilters,
    clearFilters,
  };
}

/**
 * Formats an error object into a short user-facing message.
 *
 * @param {any} err - Error instance thrown during a request.
 * @returns {string|null} Formatted error message or null if no error.
 */
function formatError(err) {
  if (!err) return null;
  if (err.response)
    return `Server error: ${err.response.status} ${err.response.statusText}`;
  if (err.request) return "Network error: no response from server";
  return `Request error: ${err.message}`;
}

/**
 * Sorts a list of transport-like objects from newest to oldest.
 *
 * It uses `createdAt` when available, or falls back to `biddingEndDate`.
 *
 * @param {any[]} list - List of items containing a `createdAt` or `biddingEndDate` field.
 * @returns {any[]} New array sorted by descending creation/bidding date.
 */
function sortByNewest(list) {
  if (!Array.isArray(list)) return [];
  const getTime = (t) => {
    const d = new Date(t.createdAt || t.biddingEndDate || 0);
    const time = d.getTime();
    return isNaN(time) ? 0 : time;
  };
  return [...list].sort((a, b) => getTime(b) - getTime(a));
}

export default useTransports;
