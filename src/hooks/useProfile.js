import { useEffect, useState } from "react";
import {
  getProfile,
  updateDriver,
  updateCompany,
  deactivateAccount,
  changePassword,
} from "../services/profileService";

/**
 * @typedef {Object} UseProfileResult
 * @property {Object|null} profile - Loaded profile information or null if not available.
 * @property {boolean} loading - Indicates whether the profile is being loaded.
 * @property {string|null} error - Error message when loading fails; null otherwise.
 * @property {function(Object): void} setProfile - Setter for the local profile state.
 * @property {function(*): Promise<Object>} saveProfile - Persists profile changes for driver/company.
 * @property {function(): Promise<Object>} deactivate - Deactivates the current account.
 * @property {function(string, string): Promise<Object>} changePwd - Changes the account password.
 */


/**
 * React hook that loads and updates the current user's profile.
 *
 * It fetches profile data based on `userId` and role flags (`isDriver`,
 * `isCompany`), and exposes helper functions to save profile changes,
 * deactivate the account and change the password.
 *
 * @param {Object} [options] - Options object specifying the user identifier and account type.
 * @param {(string|number)} [options.userId] - Identifier of the current user.
 * @param {boolean} [options.isDriver] - Whether the current user is a driver.
 * @param {boolean} [options.isCompany] - Whether the current user is a company.
 * @returns {UseProfileResult} Profile data and related update helpers.
 */
export function useProfile({ userId, isDriver, isCompany } = {}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile(userId, controller.signal);
        setProfile(data || null);
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError(err?.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId]);

  async function saveProfile(formData) {
    if (!userId) throw new Error("No user id");
    if (isDriver) return await updateDriver(userId, formData);
    if (isCompany) return await updateCompany(userId, formData);
    throw new Error("Unknown account type");
  }

  async function deactivate() {
    if (!userId) throw new Error("No user id");
    return await deactivateAccount(userId);
  }

  async function changePwd(currentPassword, newPassword) {
    if (!userId) throw new Error("No user id");
    return await changePassword(userId, currentPassword, newPassword);
  }

  return {
    profile,
    loading,
    error,
    setProfile,
    saveProfile,
    deactivate,
    changePwd,
  };
}

export default useProfile;
