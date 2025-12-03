/**
 * Bids service.
 *
 * Provides functions to list, create, update, cancel and perform manual
 * actions on bids associated with transport requests.
 */

import api from "../api/axiosConfig";

/**
 * Fetches all bids created by a specific driver.
 *
 * @async
 * @param {string|number} userId - Identifier of the driver user.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object[]>} List of bids or an empty array when none exist.
 */
export async function getBidsByDriver(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/bids/bidsByDriver/${userId}`, { signal });
  return res.data || [];
}

/**
 * Fetches active bids for a given transport request.
 *
 * @async
 * @param {string|number} transportRequestId - Identifier of the transport request.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object[]>} List of active bids or an empty array.
 */
export async function getActiveBids(transportRequestId, signal) {
  if (!transportRequestId) return [];
  const res = await api.get(
    `/bids/bidsActive?transportRequestId=${transportRequestId}`,
    { signal }
  );
  return res.data || [];
}

/**
 * Creates a new bid for a given transport request.
 *
 * @async
 * @param {Object} payload - Bid creation payload sent to the backend.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} The created bid resource.
 */
export async function createBid(payload, signal) {
  const res = await api.post(`/bids/createBid`, payload, { signal });
  return res.data;
}

/**
 * Updates an existing bid.
 *
 * @async
 * @param {string|number} bidId - Identifier of the bid to update.
 * @param {Object} payload - Updated bid data.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} The updated bid resource.
 */
export async function updateBid(bidId, payload, signal) {
  const res = await api.put(`/bids/updatebid/${bidId}`, payload, { signal });
  return res.data;
}

/**
 * Cancels an existing bid.
 *
 * @async
 * @param {string|number} bidId - Identifier of the bid to cancel.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} The bid resource after cancellation.
 */
export async function cancelBid(bidId, signal) {
  const res = await api.patch(`/bids/cancel/${bidId}`, null, { signal });
  return res.data;
}

/**
 * Performs a manual action on a bid (for example force accept/reject).
 *
 * @async
 * @param {string|number} bidId - Identifier of the bid to operate on.
 * @param {string} action - Manual action name as expected by the backend.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} The bid resource after the manual action.
 */
export async function manualBidAction(bidId, action, signal) {
  const res = await api.post(`/bids/manual/${bidId}/${action}`, null, {
    signal,
  });
  return res.data;
}

/**
 * Aggregated bids service object exposing all bid-related operations.
 *
 * @type {Object}
 */
const bidsService = {
  getBidsByDriver,
  getActiveBids,
  createBid,
  updateBid,
  cancelBid,
  manualBidAction,
};

export default bidsService;
