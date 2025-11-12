import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "../styles/ProfilePage.css";
import { useMe } from "../hooks/useMe";
import { FiEdit2, FiLock, FiUserX, FiCamera } from "react-icons/fi";
import ReactDOM from "react-dom";

function ProfilePage() {
    const { userId, isDriver, isCompany, loading: meLoading } = useMe();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const [previewLicense, setPreviewLicense] = useState(null);
    const [previewInsurance, setPreviewInsurance] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);

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
                setPreviewAvatar(res.data.profilePicture || null);
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
        if (field === "profilePicture") setPreviewAvatar(previewUrl);
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
    const confirmDeactivate = async () => {
        try {
            await api.patch(`/deactivateAccountById/${userId}`);
            alert("Conta desativada com sucesso!");
        } catch {
            alert("Erro ao desativar conta.");
        }
        setShowDeactivateModal(false);
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

                {/* Avatar + Header */}
                <div className="avatar-section">
                    <div className="avatar-wrapper">
                        <img
                            src={previewAvatar || "/default-avatar.png"}
                            alt="Avatar"
                            className="avatar-img"
                        />
                        {editing && (
                            <>
                                <label htmlFor="avatarUpload" className="avatar-overlay">
                                    <FiCamera />
                                </label>
                                <input
                                    id="avatarUpload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => handleFileChange(e, "profilePicture")}
                                />
                            </>
                        )}
                    </div>

                    <div className="header-text">
                        <h2 className="card-title-name">{profile?.name}</h2>
                        <p className="email-sub">{profile?.email}</p>
                    </div>
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

                {/* DRIVER */}
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

                {/* COMPANY */}
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
                    </div>
                ) : (
                    <div className="footer-row spaced">
                        <button className="link-icon" onClick={() => setShowPasswordModal(true)}>
                            <FiLock /> Alterar Palavra-passe
                        </button>
                        <button className="link-icon danger" onClick={() => setShowDeactivateModal(true)}>
                            <FiUserX /> Desativar Conta
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL ALTERAR PASSWORD */}
            {showPasswordModal &&
                ReactDOM.createPortal(
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Alterar Palavra-passe</h3>
                            <input
                                type="password"
                                placeholder="Senha atual"
                                value={passwords.old}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, old: e.target.value })
                                }
                            />
                            <input
                                type="password"
                                placeholder="Nova senha"
                                value={passwords.new}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, new: e.target.value })
                                }
                            />
                            <input
                                type="password"
                                placeholder="Confirmar nova senha"
                                value={passwords.confirm}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, confirm: e.target.value })
                                }
                            />
                            <div className="modal-actions">
                                <button
                                    onClick={handlePasswordChange}
                                    className="btn primary"
                                >
                                    Guardar
                                </button>
                                <button
                                    className="btn danger"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}


            {/* MODAL DESATIVAR CONTA */}
            {showDeactivateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Desativar Conta</h3>
                        <p>Tem a certeza que deseja desativar a sua conta? Esta ação é reversível apenas por suporte.</p>
                        <div className="modal-actions">
                            <button className="btn danger" onClick={confirmDeactivate}>Confirmar</button>
                            <button className="btn ghost" onClick={() => setShowDeactivateModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;
