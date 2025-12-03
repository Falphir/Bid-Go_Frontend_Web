/**
 * History service.
 *
 * Provides access to historical transport and bidding information for
 * both drivers and companies.
 */

import api from "../api/axiosConfig";
import {
  normalizeHistoryDriver,
  normalizeHistoryCompany,
} from "../utils/normalizers";

/**
 * Fetches the historical data for a driver.
 *
 * @async
 * @param {string|number} userId - Identifier of the driver user.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object[]>} Normalized history entries for the driver.
 */
export async function getDriverHistory(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/history/driver/${userId}`, { signal });
  return normalizeHistoryDriver(res.data);
}

/**
 * Fetches the historical data for a company.
 *
 * @async
 * @param {string|number} userId - Identifier of the company user.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object[]>} Normalized history entries for the company.
 */
export async function getCompanyHistory(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/history/company/${userId}`, { signal });
  return normalizeHistoryCompany(res.data);
}

/**
 * Aggregated history service exposing driver and company history loaders.
 *
 * @type {Object}
 */
const historyService = { getDriverHistory, getCompanyHistory };
export default historyService;
