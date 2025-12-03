import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  getTransportById,
  updateTransport,
  publishCompanyTransport,
  cancelTransport,
  updateTransportStatus,
} from "../services/transportsService";
import {
  getActiveBids,
  createBid,
  updateBid,
  cancelBid,
  manualBidAction,
} from "../services/bidsService";

/**
 * Result object returned by {@link useRequestDetails}.
 *
 * @typedef {Object} UseRequestDetailsResult
 * @property {Object|null} transport - Current transport request being displayed.
 * @property {Object[]} bids - Active bids for the request when status is ACTIVE.
 * @property {Object|null} acceptedBid - Accepted bid when the request is in a later status.
 * @property {boolean} loading - Indicates whether data is being loaded.
 * @property {string|null} error - Error message when loading fails; null otherwise.
 * @property {function(): Promise<*>} refreshTransport - Reloads the transport details from the API.
 * @property {function(): Promise<void>} loadActiveBids - Fetches the current active bids.
 * @property {function(Object): Promise<*>} createBidForTransport - Creates a bid and refreshes the list.
 * @property {function(*, Object): Promise<*>} updateExistingBid - Updates an existing bid and refreshes local state.
 * @property {function(*): Promise<*>} cancelExistingBid - Cancels a bid and removes it from the list.
 * @property {function(*, string): Promise<*>} manualAction - Triggers a manual action (accept/reject) on a bid.
 * @property {function(Object): Promise<*>} saveTransport - Saves changes to the transport.
 * @property {function(): Promise<*>} publishTransport - Publishes a draft transport.
 * @property {function(): Promise<*>} cancelExistingTransport - Cancels the transport.
 * @property {function(string): Promise<*>} setStatus - Updates the transport status.
 */


/**
 * React hook that loads a single transport request and its related bids
 * and exposes high-level actions to manage both the transport and the
 * bids list.
 *
 * @param {Object} [options] - Hook options.
 * @param {(string|number)} [options.transportId] - Identifier of the transport request to load.
 * @returns {UseRequestDetailsResult} Request data, bids and action helpers.
 */
export function useRequestDetails({ transportId } = {}) {
  const [transport, setTransport] = useState(null);
  const [bids, setBids] = useState([]);
  const [acceptedBid, setAcceptedBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActiveBids = useCallback(
    async (signal) => {
      if (!transportId) return;
      const bidsRes = await getActiveBids(transportId, signal);

      const updatedBids = await Promise.all(
        bidsRes.map(async (bid) => {
          try {
            const ratingRes = await api.get(
              `/reviewRequest/average/driver/${bid.driver.driverId}`
            );
            return {
              ...bid,
              driver: { ...bid.driver, averageRating: ratingRes.data.average },
            };
          } catch {
            return { ...bid, driver: { ...bid.driver, averageRating: null } };
          }
        })
      );

      setBids(updatedBids);
      setAcceptedBid(null);
    },
    [transportId]
  );

  useEffect(() => {
    if (!transportId) return;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const tr = await getTransportById(transportId, controller.signal);
        setTransport(tr);

        const status = String(tr?.status ?? "").toUpperCase();

        if (
          status === "DRAFT" ||
          status === "CANCELED" ||
          status === "CANCELLED"
        ) {
          setBids([]);
          setAcceptedBid(null);
          return;
        }

        if (status === "ACTIVE") {
          await loadActiveBids(controller.signal);
          return;
        }

        if (
          status === "WAITINGPICKUP" ||
          status === "PENDENT" ||
          status === "PENDING" ||
          status === "INTRANSIT" ||
          status === "COMPLETED"
        ) {
          try {
            const accRes = await api.get(
              `/bids/manual/byrequest/${transportId}/Accepted`
            );
            const bid = Array.isArray(accRes.data)
              ? accRes.data[0]
              : accRes.data;
            setAcceptedBid(bid || null);
            setBids([]);
          } catch (err) {
            if (err?.response?.status === 404) {
              setAcceptedBid(null);
              setBids([]);
            } else throw err;
          }
          return;
        }

        setBids([]);
        setAcceptedBid(null);
      } catch (err) {
        const isCanceled =
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED" ||
          err?.message === "canceled" ||
          err?.name === "AbortError";
        if (!isCanceled) {
          setError(err?.message || "Failed to load data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [transportId, loadActiveBids]);

  const refreshTransport = async () => {
    if (!transportId) return;
    const res = await getTransportById(transportId);
    setTransport(res);
    return res;
  };

  const createBidForTransport = async (payload) => {
    const res = await createBid(payload);
    await loadActiveBids();
    return res;
  };

  const updateExistingBid = async (bidId, payload) => {
    const res = await updateBid(bidId, payload);
    setBids((prev) =>
      prev.map((b) => (b.bidId === bidId ? { ...b, ...payload } : b))
    );
    return res;
  };

  const cancelExistingBid = async (bidId) => {
    const res = await cancelBid(bidId);
    setBids((prev) => prev.filter((b) => b.bidId !== bidId));
    return res;
  };

  const manualAction = async (bidId, type) => {
    const res = await manualBidAction(bidId, type);
    await refreshTransport();
    return res;
  };

  const saveTransport = async (payload) => {
    const res = await updateTransport(transportId, payload);
    await refreshTransport();
    return res;
  };

  const publishTransport = async () => {
    const res = await publishCompanyTransport(transportId);
    await refreshTransport();
    return res;
  };

  const cancelExistingTransport = async () => {
    const res = await cancelTransport(transportId);
    await refreshTransport();
    return res;
  };

  const setStatus = async (target) => {
    const res = await updateTransportStatus(transportId, target);
    await refreshTransport();
    return res;
  };

  return {
    transport,
    bids,
    acceptedBid,
    loading,
    error,
    refreshTransport,
    loadActiveBids,
    createBidForTransport,
    updateExistingBid,
    cancelExistingBid,
    manualAction,
    saveTransport,
    publishTransport,
    cancelExistingTransport,
    setStatus,
  };
}

export default useRequestDetails;
