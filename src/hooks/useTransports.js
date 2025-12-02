import { useCallback, useEffect, useState } from "react";
import {
  getCompanyTransports,
  getDriverTransports,
} from "../services/transportsService";

// Hook de listagem de pedidos (driver/empresa) com filtros

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

function formatError(err) {
  if (!err) return null;
  if (err.response)
    return `Server error: ${err.response.status} ${err.response.statusText}`;
  if (err.request) return "Network error: no response from server";
  return `Request error: ${err.message}`;
}

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
