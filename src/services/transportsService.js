/**
 * Transport service.
 *
 * Provides functions to list, create, update and manage the lifecycle
 * of transport requests for both companies and drivers.
 */

import api from "../api/axiosConfig";
import { normalizeTransportList } from "../utils/normalizers";

/**
 * Builds a query string for transport filtering from a filters object.
 *
 * @param {Object} [filters] - Optional filter object.
 * @param {string} [filters.origin] - Origin location filter.
 * @param {string} [filters.destination] - Destination location filter.
 * @param {string} [filters.deliveryDate] - Desired delivery date filter.
 * @param {"asc"|"desc"} [filters.priceOrder] - Price ordering filter.
 * @returns {string} Encoded query string (without leading `?`).
 */
function buildQueryString(filters) {
  const params = new URLSearchParams();
  if (!filters) return "";
  if (filters.origin) params.append("origin", filters.origin);
  if (filters.destination) params.append("destination", filters.destination);
  if (filters.deliveryDate) params.append("deliveryDate", filters.deliveryDate);
  if (filters.priceOrder) params.append("priceOrder", filters.priceOrder);
  return params.toString();
}

/**
 * Fetches transports associated with a specific company.
 *
 * @async
 * @param {string|number} userId - Identifier of the company owner.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any[]>} A normalized list of company transports.
 */
export async function getCompanyTransports(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/transports/company/${userId}`, { signal });
  return normalizeTransportList(res?.data);
}

/**
 * Fetches transports available for drivers, optionally filtered.
 *
 * @async
 * @param {Object} [filters] - Optional transport filters used to build the query string.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any[]>} A normalized list of driver-visible transports.
 */
export async function getDriverTransports(filters, signal) {
  const qs = buildQueryString(filters);
  const url = qs ? `/pageTransports/filters?${qs}` : `/pageTransports/filters`;
  const res = await api.get(url, { signal });
  return normalizeTransportList(res?.data);
}

/**
 * Creates a new transport request using a JSON payload.
 *
 * @async
 * @param {Object} payload - Transport creation payload in JSON format.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The created transport returned by the API.
 */
export async function createTransportJson(payload, signal) {
  const res = await api.post("/transports/createTransport", payload, {
    signal,
  });
  return res.data;
}

/**
 * Creates a new transport request using multipart/form-data.
 *
 * Intended for payloads containing files or binary data.
 *
 * @async
 * @param {FormData} formData - Form data with the transport creation payload.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The created transport returned by the API.
 */
export async function createTransportForm(formData, signal) {
  const res = await api.post("/transports/createTransport", formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Creates a new draft transport using a JSON payload.
 *
 * Draft transports are not immediately published for bidding.
 *
 * @async
 * @param {Object} payload - Draft transport payload in JSON format.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The created draft transport.
 */
export async function createDraftJson(payload, signal) {
  const res = await api.post("/transports/createDRAFTTransport", payload, {
    signal,
  });
  return res.data;
}

/**
 * Creates a new draft transport using multipart/form-data.
 *
 * @async
 * @param {FormData} formData - Form data with the draft transport payload.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The created draft transport.
 */
export async function createDraftForm(formData, signal) {
  const res = await api.post("/transports/createDRAFTTransport", formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Retrieves a single transport by its identifier.
 *
 * @async
 * @param {string|number} transportId - Unique identifier of the transport.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The transport resource as returned by the API.
 */
export async function getTransportById(transportId, signal) {
  const res = await api.get(`/transports/${transportId}`, { signal });
  return res.data;
}

/**
 * Updates an existing transport.
 *
 * The function first tries a POST request and falls back to PUT when the
 * backend returns HTTP 405 (Method Not Allowed), ensuring compatibility
 * with different API versions.
 *
 * @async
 * @param {string|number} transportId - Unique identifier of the transport.
 * @param {Object} payload - Updated transport data.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The updated transport resource.
 */
export async function updateTransport(transportId, payload, signal) {
  try {
    const res = await api.post(
      `/transports/updateTransport/${transportId}`,
      payload,
      { signal }
    );
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 405) {
      const res = await api.put(
        `/transports/updateTransport/${transportId}`,
        payload,
        { signal }
      );
      return res.data;
    }
    throw err;
  }
}

/**
 * Publishes a company transport so it becomes visible for bidding.
 *
 * @async
 * @param {string|number} transportId - Unique identifier of the transport.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The updated transport resource after publishing.
 */
export async function publishCompanyTransport(transportId, signal) {
  const res = await api.put(
    `/transports/company/publish/${transportId}`,
    null,
    { signal }
  );
  return res.data;
}

/**
 * Cancels a transport request.
 *
 * @async
 * @param {string|number} transportId - Unique identifier of the transport.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The updated transport resource after cancellation.
 */
export async function cancelTransport(transportId, signal) {
  const res = await api.put(`/transports/canceled/${transportId}`, null, {
    signal,
  });
  return res.data;
}

/**
 * Updates the status of a transport request.
 *
 * @async
 * @param {string|number} transportId - Unique identifier of the transport.
 * @param {string} status - New status to set for the transport.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} The updated transport resource with the new status.
 */
export async function updateTransportStatus(transportId, status, signal) {
  const res = await api.put(
    `/transports/updateStatus/${transportId}`,
    { status },
    { signal }
  );
  return res.data;
}
