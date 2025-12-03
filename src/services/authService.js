/**
 * Authentication service.
 *
 * Wraps HTTP calls related to user authentication and registration,
 * such as login, driver/company registration and password recovery.
 */

import api from "../api/axiosConfig";

/**
 * Logs a user into the Bid-Go platform.
 *
 * @async
 * @param {string} email - User email address.
 * @param {string} password - User plain-text password.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} Resolves with the backend response data (auth tokens and user info).
 */
export async function login(email, password, signal) {
  const res = await api.post("/auth/login", { email, password }, { signal });
  return res.data;
}

/**
 * Convenience default export grouping authentication API functions.
 * Contains at least {@link login} and can be extended with other auth actions.
 *
 * @type {Object}
 */
const authService = { login };
export default authService;

/**
 * Registers a new driver account.
 *
 * @async
 * @param {FormData} formData - Form data containing the driver registration payload.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} Resolves with the created driver information returned by the API.
 */
export async function registerDriver(formData, signal) {
  const res = await api.post(`/register/driver`, formData, { signal });
  return res.data;
}

/**
 * Registers a new company account.
 *
 * @async
 * @param {Object} payload - JSON payload with company registration data.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} Resolves with the created company information returned by the API.
 */
export async function registerCompany(payload, signal) {
  const res = await api.post(`/register/company`, payload, { signal });
  return res.data;
}

/**
 * Initiates the password recovery process by sending a recovery email.
 *
 * @async
 * @param {string} email - Email address associated with the account.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} Resolves when the recovery email has been accepted by the backend.
 */
export async function recoverPassword(email, signal) {
  const res = await api.post(`/auth/recover-password`, { email }, { signal });
  return res.data;
}

/**
 * Resets the user password using a previously issued token.
 *
 * @async
 * @param {string} token - Password reset token provided via email.
 * @param {string} newPassword - New password to set for the account.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<any>} Resolves when the password has been successfully reset.
 */
export async function resetPassword(token, newPassword, signal) {
  const res = await api.post(
    `/auth/reset-password`,
    { token, newPassword },
    { signal }
  );
  return res.data;
}
