import { useEffect, useState } from "react";
import { getProfile, updateDriver, updateCompany, deactivateAccount, changePassword } from "../services/profileService";

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

  return { profile, loading, error, setProfile, saveProfile, deactivate, changePwd };
}

export default useProfile;
