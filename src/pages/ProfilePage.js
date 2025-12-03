import React, { useState } from "react";
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
import useProfile from "../hooks/useProfile";

/**
 * User profile page for both driver and company accounts.
 *
 * It loads the current profile using {@link useProfile}, lets the user
 * edit core fields, upload images (avatar and driver documents),
 * change the password and deactivate the account.
 *
 * @returns {JSX.Element} Rendered profile page.
 */

function ProfilePage() {
    const { userId, isDriver, isCompany, loading: meLoading } = useMe();

    const { profile, loading, error, setProfile, saveProfile, deactivate, changePwd } = useProfile({ userId, isDriver, isCompany });

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
            await saveProfile(formData);
            showToast("Profile updated successfully!", "success");
            setEditing(false);
        } catch (err) {
            const msg = getApiErrorMessage(err);
            showToast(msg, "error");
        }
    };

    const confirmDeactivate = async () => {
        try {
            setDeactivateLoading(true);
            await deactivate();
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
        const oldPwd = (passwords.old || "").trim();
        const newPwd = (passwords.new || "").trim();
        const confirmPwd = (passwords.confirm || "").trim();


        if (!oldPwd || !newPwd || !confirmPwd) {
            showToast("Please fill all password fields.", "error");
            return;
        }
        if (newPwd !== confirmPwd) {
            showToast("Passwords do not match.", "error");
            return;
        }
        if (oldPwd === newPwd) {
            showToast("New password must be different from current password.", "error");
            return;
        }
        if (newPwd.length < 6) {
            showToast("New password must be at least 6 characters.", "error");
            return;
        }

        try {
            await changePwd(oldPwd, newPwd);
            showToast("Password updated successfully!", "success");
            setShowPasswordModal(false);
            setPasswords({ old: "", new: "", confirm: "" });
        } catch (err) {
            const msg = getApiErrorMessage(err);
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

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <StatusMessage type="error">{String(error)}</StatusMessage>
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
