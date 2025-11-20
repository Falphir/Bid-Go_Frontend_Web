import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "../styles/ProfilePage.css";
import { useMe } from "../hooks/useMe";
import {
    FiEdit2,
    FiLock,
    FiUserX,
    FiCamera,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";
import PasswordInput from "../components/PasswordInput/PasswordInput";
import AvatarCropper from "../components/AvatarCropper/AvatarCropper";
import AvatarSection from "../components/profile/AvatarSection";
import DriverDocsSection from "../components/profile/DriverDocsSection";
import DriverFormGrid from "../components/profile/DriverFormGrid";
import CompanyFormGrid from "../components/profile/CompanyFormGrid";
import PasswordChangeModal from "../components/profile/PasswordChangeModal";
import DeactivateAccountModal from "../components/profile/DeactivateAccountModal";
import ReactDOM from "react-dom";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
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

    // modals and loading
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

    const [message, setMessage] = useState(null);
    const { showToast } = useToast();

    // load profile
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
    }, [userId]);

    // uploads
    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        if (field === "driverLicense") setPreviewLicense(previewUrl);
        if (field === "insurance") setPreviewInsurance(previewUrl);
        if (field === "ProfileImage") setPreviewAvatar(previewUrl);
        setProfile({ ...profile, [field]: file });
    };

    // save profile
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

    // deactivate account
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

    // change password
    const handlePasswordChange = async () => {
        try {
            // 1. Validate confirmation
            if (passwords.new !== passwords.confirm) {
                showToast("Passwords do not match.", "error");
                return;
            }

            // 2. API call
            await api.put(`/profile/${userId}/changePassword`, {
                currentPassword: passwords.old,
                newPassword: passwords.new,
            });

            // 3. Success
            showToast("Password updated successfully!", "success");

            // 4. Close modal + reset
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

                {/* DRIVER */}
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

                {/* COMPANY */}
                {isCompany && (
                    <CompanyFormGrid
                        profile={profile}
                        editing={editing}
                        onChange={(field, value) =>
                            setProfile({ ...profile, [field]: value })
                        }
                    />
                )}

                {/* actions */}
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

            {/* PASSWORD MODAL */}
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

            {/* DEACTIVATE ACCOUNT MODAL */}
            <DeactivateAccountModal
                open={showDeactivateModal}
                loading={deactivateLoading}
                onConfirm={confirmDeactivate}
                onCancel={() => setShowDeactivateModal(false)}
            />

            {/* avatar cropper */}
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
