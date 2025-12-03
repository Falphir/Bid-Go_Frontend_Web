/**
 * Profile service.
 *
 * Provides functions to read and update user profile information for
 * both drivers and companies, as well as to manage account status and
 * change passwords.
 */

import api from "../api/axiosConfig";

/**
 * Fetches the profile information for a given user.
 *
 * @async
 * @param {string|number} userId - Identifier of the user.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object|null>} Profile data or null when no userId is provided.
 */
export async function getProfile(userId, signal) {
  if (!userId) return null;
  const res = await api.get(`/profile/${userId}`, { signal });
  return res.data;
}

/**
 * Updates a driver profile using multipart/form-data.
 *
 * @async
 * @param {string|number} userId - Identifier of the driver.
 * @param {FormData} formData - Form data with updated driver profile fields.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} Updated driver profile.
 */
export async function updateDriver(userId, formData, signal) {
  const res = await api.put(`profile/updateDriver/${userId}`, formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Updates a company profile using multipart/form-data.
 *
 * @async
 * @param {string|number} userId - Identifier of the company.
 * @param {FormData} formData - Form data with updated company profile fields.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} Updated company profile.
 */
export async function updateCompany(userId, formData, signal) {
  const res = await api.put(`profile/updateCompany/${userId}`, formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Deactivates a user account.
 *
 * @async
 * @param {string|number} userId - Identifier of the user.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} Backend response after deactivation.
 */
export async function deactivateAccount(userId, signal) {
  const res = await api.put(`/profile/${userId}/deactivateAccount`, null, {
    signal,
  });
  return res.data;
}

/**
 * Changes the password for a user account.
 *
 * @async
 * @param {string|number} userId - Identifier of the user.
 * @param {string} currentPassword - Current password of the user.
 * @param {string} newPassword - New password to be set.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Object>} Backend response after the password change.
 */
export async function changePassword(
  userId,
  currentPassword,
  newPassword,
  signal
) {
  const res = await api.put(
    `/profile/${userId}/changePassword`,
    { currentPassword, newPassword },
    { signal }
  );
  return res.data;
}

/**
 * Aggregated profile service exposing profile and credential operations.
 *
 * @type {Object}
 */
const profileService = {
  getProfile,
  updateDriver,
  updateCompany,
  deactivateAccount,
  changePassword,
};
export default profileService;
