import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "../styles/ProfilePage.css";
import { useMe } from "../hooks/useMe";
import { FiEdit2, FiLock } from "react-icons/fi";

function ProfilePage() {
  const { userId, isDriver, isCompany, loading: meLoading } = useMe();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [previewLicense, setPreviewLicense] = useState(null);
  const [previewInsurance, setPreviewInsurance] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

  const [message, setMessage] = useState(null);

  // carregar perfil
  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${userId}`);
        setProfile(res.data);
        setPreviewLicense(res.data.driverLicense || res.data.driverLicenseUrl || null);
        setPreviewInsurance(res.data.insurance || res.data.insuranceUrl || null);
      } catch {
        setMessage({ type: "error", text: "Erro ao carregar perfil." });
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
    setProfile({ ...profile, [field]: file });
  };

  // guardar
  const handleSave = async () => {
    const formData = new FormData();
    Object.entries(profile).forEach(([k, v]) => formData.append(k, v));
    try {
      const endpoint = isDriver ? `profile/updateDriver/${userId}` : "profile/updateCompany";
      await api.put(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      setEditing(false);
    } catch {
      setMessage({ type: "error", text: "Erro ao atualizar perfil." });
    }
  };

  // desativar
  const handleDeactivate = async () => {
    if (!window.confirm("Tens a certeza que queres desativar a tua conta?")) return;
    try {
      await api.patch(`/deactivateAccountById/${userId}`);
      alert("Conta desativada com sucesso!");
    } catch {
      alert("Erro ao desativar conta.");
    }
  };

  // alterar password
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "As senhas não coincidem!" });
      return;
    }
    try {
      await api.post("/changePassword", {
        userId,
        oldPassword: passwords.old,
        newPassword: passwords.new,
      });
      setShowPasswordModal(false);
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setPasswords({ old: "", new: "", confirm: "" });
    } catch {
      setMessage({ type: "error", text: "Erro ao alterar senha." });
    }
  };

  if (meLoading || loading) {
    return (
      <div className="profile-page">
        <div className="profile-card"><p className="status-message">A carregar…</p></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="card-header">
          <h2 className="card-title">O meu perfil</h2>
          {!editing && (
            <button className="link-button" onClick={() => setEditing(true)}>
              <FiEdit2 /> Editar Perfil
            </button>
          )}
        </div>

        {message && (
          <div
            className={`banner ${message.type === "success" ? "success" : ""} ${
              message.type === "error" ? "error" : ""
            } ${message.type === "info" ? "info" : ""}`}
          >
            {message.text}
          </div>
        )}

        {/* DRIVER: 1 coluna + uploads lado a lado */}
        {isDriver && (
          <>
            <div className={`form-grid one-col ${!editing ? "readonly" : ""}`}>
              <label className="form-label">
                Nome
                <input
                  type="text"
                  disabled={!editing}
                  value={profile?.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </label>

              <label className="form-label">
                Email
                <input
                  type="email"
                  disabled={!editing}
                  value={profile?.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </label>

              <label className="form-label">
                Telefone
                <input
                  type="text"
                  disabled={!editing}
                  value={profile?.phoneNumber || ""}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                />
              </label>

              <label className="form-label">
                NIF
                <input
                  type="text"
                  disabled={!editing}
                  value={profile?.nif || ""}
                  onChange={(e) => setProfile({ ...profile, nif: e.target.value })}
                />
              </label>
            </div>

            <div className="driver-block">
              <div className="upload-tile">
                <span className="tile-label">Carta de Condução</span>
                {editing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "driverLicense")}
                  />
                )}
                {previewLicense && <img src={previewLicense} alt="Carta" />}
              </div>

              <div className="upload-tile">
                <span className="tile-label">Seguro</span>
                {editing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "insurance")}
                  />
                )}
                {previewInsurance && <img src={previewInsurance} alt="Seguro" />}
              </div>
            </div>
          </>
        )}

        {/* COMPANY: Nome + Nome da Empresa em 2 colunas, resto full width */}
        {isCompany && (
          <div className={`form-grid company-layout ${!editing ? "readonly" : ""}`}>
            <label className="form-label span-1">
              Nome
              <input
                type="text"
                disabled={!editing}
                value={profile?.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </label>

            <label className="form-label span-1">
              Nome da Empresa
              <input
                type="text"
                disabled={!editing}
                value={profile?.companyName || ""}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              />
            </label>

            <label className="form-label span-2">
              Email
              <input
                type="email"
                disabled={!editing}
                value={profile?.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </label>

            <label className="form-label span-2">
              Endereço
              <input
                type="text"
                disabled={!editing}
                value={profile?.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </label>

            <label className="form-label span-2">
              Telefone
              <input
                type="text"
                disabled={!editing}
                value={profile?.phoneNumber || ""}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              />
            </label>

            <label className="form-label span-2">
              NIF
              <input
                type="text"
                disabled={!editing}
                value={profile?.nif || ""}
                onChange={(e) => setProfile({ ...profile, nif: e.target.value })}
              />
            </label>
          </div>
        )}

        {/* ações */}
        {editing ? (
          <div className="actions">
            <div className="actions-left">
              <button onClick={handleSave} className="btn primary">Guardar alterações</button>
              <button
                className="btn ghost"
                onClick={() => {
                  setEditing(false);
                  setMessage({ type: "info", text: "Edição cancelada." });
                }}
              >
                Cancelar
              </button>
            </div>
            <button className="btn danger" onClick={handleDeactivate}>
              Desativar conta
            </button>
          </div>
        ) : (
          <div className="footer-row">
            <button className="link-icon" onClick={() => setShowPasswordModal(true)}>
              <FiLock /> Alterar Palavra-passe
            </button>
          </div>
        )}
      </div>

      {/* MODAL ALTERAR PASSWORD */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Alterar Palavra-passe</h3>
            <input
              type="password"
              placeholder="Senha atual"
              value={passwords.old}
              onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
            />
            <input
              type="password"
              placeholder="Nova senha"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={handlePasswordChange} className="btn primary">Guardar</button>
              <button className="btn danger" onClick={() => setShowPasswordModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
