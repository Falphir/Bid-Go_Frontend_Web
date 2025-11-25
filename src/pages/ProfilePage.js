import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "../styles/ProfilePage.css";
import { useMe } from "../hooks/useMe";
import {
    FiLock,
    FiUserX,
} from "react-icons/fi";
import AvatarCropper from "../components/AvatarCropper/AvatarCropper";
import AvatarSection from "../components/profile/AvatarSection";
import DriverDocsSection from "../components/profile/DriverDocsSection";
import DriverFormGrid from "../components/profile/DriverFormGrid";
import CompanyFormGrid from "../components/profile/CompanyFormGrid";
import PasswordChangeModal from "../components/profile/PasswordChangeModal";
import DeactivateAccountModal from "../components/profile/DeactivateAccountModal";
import { getApiErrorMessage } from "../utils/httpError";
import StatusMessage from "../components/feedback/StatusMessage";
import { useToast } from "../components/feedback/ToastContext";
import Button from "../components/Button/Button";

function ProfilePage() {
    const { userId, isDriver, isCompany, loading: meLoading } = useMe();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [cropImage, setCropImage] = useState(null);

    const [previewLicense, setPreviewLicense] = useState(null);
    const [previewInsurance, setPreviewInsurance] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

    const { showToast } = useToast();

    useEffect(() => {
        if (!userId) return;
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profile/${userId}`);
                setProfile(res.data);
                setPreviewLicense(
                    res.data.driverLicense || res.data.driverLicenseUrl || null
                );
                setPreviewInsurance(
                    res.data.insurance || res.data.insuranceUrl || null
                );
                setPreviewAvatar(res.data.profileImage || null);
            } catch (err) {
                const msg = getApiErrorMessage(err);
                showToast(msg, "error");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, showToast]);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        if (field === "driverLicense") setPreviewLicense(previewUrl);
        if (field === "insurance") setPreviewInsurance(previewUrl);
        if (field === "ProfileImage") setPreviewAvatar(previewUrl);
        setProfile({ ...profile, [field]: file });
    };

    const handleSave = async () => {
        const formData = new FormData();
        Object.entries(profile).forEach(([k, v]) => formData.append(k, v));
        try {
            const endpoint = isDriver
                ? `profile/updateDriver/${userId}`
                : `profile/updateCompany/${userId}`;
            await api.put(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            showToast("Profile updated successfully!", "success");
            setEditing(false);
        } catch (err) {
            const msg = getApiErrorMessage(err);
            showToast(msg, "error");
        } finally {
        }
    };

    const confirmDeactivate = async () => {
        try {
            setDeactivateLoading(true);
            await api.put(`/profile/${userId}/deactivateAccount`);
            showToast("Account successfully deactivated", "success");

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (err) {
            const msg = getApiErrorMessage(err);
            showToast(msg, "error");
        } finally {
            setDeactivateLoading(false);
            setShowDeactivateModal(false);
        }
    };

    const handlePasswordChange = async () => {
        try {
            if (passwords.new !== passwords.confirm) {
                showToast("Passwords do not match.", "error");
                return;
            }

            await api.put(`/profile/${userId}/changePassword`, {
                currentPassword: passwords.old,
                newPassword: passwords.new,
            });

            showToast("Password updated successfully!", "success");

            setShowPasswordModal(false);
            setPasswords({ old: "", new: "", confirm: "" });
        } catch (err) {
            const msg = err.response?.data || "Error changing password.";
            showToast(msg, "error");
        }
    };

    if (meLoading || loading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <StatusMessage type="loading">Loading…</StatusMessage>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <AvatarSection
                    profile={profile}
                    previewAvatar={previewAvatar}
                    editing={editing}
                    onStartEdit={() => setEditing(true)}
                    onSelectAvatar={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const preview = URL.createObjectURL(file);
                        setCropImage(preview);
                    }}
                />

                {isDriver && (
                    <>
                        <DriverFormGrid
                            profile={profile}
                            editing={editing}
                            onChange={(field, value) =>
                                setProfile({ ...profile, [field]: value })
                            }
                        />
                        <DriverDocsSection
                            editing={editing}
                            previewLicense={previewLicense}
                            previewInsurance={previewInsurance}
                            onFileChange={handleFileChange}
                        />
                    </>
                )}

                {isCompany && (
                    <CompanyFormGrid
                        profile={profile}
                        editing={editing}
                        onChange={(field, value) =>
                            setProfile({ ...profile, [field]: value })
                        }
                    />
                )}

                {editing ? (
                    <div className="actions">
                        <div className="actions-left">
                            <Button variant="primary" onClick={handleSave}>
                                Save changes
                            </Button>

                            <Button variant="secondary" onClick={() => setEditing(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="footer-row spaced">
                        <button
                            className="link-icon"
                            onClick={() => {
                                setPasswords({ old: "", new: "", confirm: "" });
                                setShowPasswordModal(true);
                            }}
                        >
                            <FiLock /> Change Password
                        </button>
                        <button
                            className="link-icon danger"
                            onClick={() => setShowDeactivateModal(true)}
                        >
                            <FiUserX /> Deactivate Account
                        </button>
                    </div>
                )}
            </div>

            <PasswordChangeModal
                open={showPasswordModal}
                passwords={passwords}
                onChangeField={(field, value) =>
                    setPasswords({ ...passwords, [field]: value })
                }
                onSave={handlePasswordChange}
                onClose={() => {
                    setShowPasswordModal(false);
                    setPasswords({ old: "", new: "", confirm: "" });
                }}
            />

            <DeactivateAccountModal
                open={showDeactivateModal}
                loading={deactivateLoading}
                onConfirm={confirmDeactivate}
                onCancel={() => setShowDeactivateModal(false)}
            />

            {cropImage && (
                <AvatarCropper
                    image={cropImage}
                    onCancel={() => setCropImage(null)}
                    onSave={(croppedFile) => {
                        setPreviewAvatar(URL.createObjectURL(croppedFile));
                        setProfile({ ...profile, profileImage: croppedFile });
                        setCropImage(null);
                    }}
                />
            )}
        </div>
    );
}

export default ProfilePage;
