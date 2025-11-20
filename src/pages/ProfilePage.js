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

  // modais e loading
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

  const [message, setMessage] = useState(null);
  const { showToast } = useToast();

  // carregar perfil
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

  // guardar perfil
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
      showToast("Perfil atualizado com sucesso!", "success");
      setEditing(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      showToast(msg, "error");
    } finally {
    }
  };
  //Desativar a conta

  const confirmDeactivate = async () => {
    try {
      setDeactivateLoading(true);
      await api.put(`/profile/${userId}/deactivateAccount`);
      showToast("Conta desativada com sucesso", "success");

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

  // alterar password
  const handlePasswordChange = async () => {
    try {
      // 1. Validar confirmação da nova password
      if (passwords.new !== passwords.confirm) {
        showToast("As palavras-passe não coincidem.", "error");
        return;
      }

      // 2. Chamada correta ao backend
      await api.put(`/profile/${userId}/changePassword`, {
        currentPassword: passwords.old,
        newPassword: passwords.new,
      });

      // 3. Sucesso
      showToast("Palavra-passe alterada com sucesso!", "success");

      // 4. Fechar modal + limpar inputs
      setShowPasswordModal(false);
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (err) {
      const msg = err.response?.data || "Erro ao alterar palavra-passe.";
      showToast(msg, "error");
    }
  };

  if (meLoading || loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <StatusMessage type="loading">A carregar…</StatusMessage>
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

        {/* ações */}
        {editing ? (
          <div className="actions">
            <div className="actions-left">
                <Button
                    variant="primary"
                    onClick={handleSave}
                >
                    Guardar alterações
                </Button>

                <Button
                    variant="secondary"
                    onClick={() => setEditing(false)}
                >
                    Cancelar
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
              <FiLock /> Alterar Palavra-passe
            </button>
            <button
              className="link-icon danger"
              onClick={() => setShowDeactivateModal(true)}
            >
              <FiUserX /> Desativar Conta
            </button>
          </div>
        )}
      </div>

      {/* MODAL ALTERAR PASSWORD */}
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

      {/* MODAL DESATIVAR CONTA */}
      <DeactivateAccountModal
        open={showDeactivateModal}
        loading={deactivateLoading}
        onConfirm={confirmDeactivate}
        onCancel={() => setShowDeactivateModal(false)}
      />
      {/* Toasts agora geridos globalmente pelo ToastProvider */}

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
