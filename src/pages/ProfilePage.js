import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "../styles/ProfilePage.css";
import { useMe } from "../hooks/useMe";

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

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (field === "driverLicense") setPreviewLicense(previewUrl);
            if (field === "insurance") setPreviewInsurance(previewUrl);
            setProfile({ ...profile, [field]: file });
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        Object.entries(profile).forEach(([key, value]) => {
            formData.append(key, value);
        });
        try {
            const endpoint = isDriver ? `profile/updateDriver/${userId}` : "profile/updateCompany";
            await api.put(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
            setEditing(false);
        } catch {
            setMessage({ type: "error", text: "Erro ao atualizar perfil." });
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm("Tens a certeza que queres desativar a tua conta?")) return;
        try {
            await api.patch(`/deactivateAccountById/${userId}`);
            alert("Conta desativada com sucesso!");
        } catch {
            alert("Erro ao desativar conta.");
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm)
            return setMessage({ type: "error", text: "As senhas não coincidem!" });

        try {
            await api.post("/changePassword", {
                userId,
                oldPassword: passwords.old,
                newPassword: passwords.new,
            });
            setShowPasswordModal(false);
            setMessage({ type: "success", text: "Senha alterada com sucesso!" });
        } catch {
            setMessage({ type: "error", text: "Erro ao alterar senha." });
        }
    };

    if (meLoading || loading) return <p className="status-message">A carregar…</p>;

    return (
        <div className="profile-page">
            <h2>O meu perfil</h2>

            <div className="profile-card">
                {!editing && (
                    <button className="edit-btn" onClick={() => setEditing(true)}>
                        ✏️ Editar Perfil
                    </button>
                )}

                <div className={`profile-fields ${!editing ? "readonly" : ""}`}>
                    <label>
                        Nome:
                        <input
                            type="text"
                            disabled={!editing}
                            value={profile?.name || ""}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                    </label>

                    {isCompany && (
                        <>
                            <label>
                                Nome da Empresa:
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={profile?.companyName || ""}
                                    onChange={(e) =>
                                        setProfile({ ...profile, companyName: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Endereço:
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={profile?.address || ""}
                                    onChange={(e) =>
                                        setProfile({ ...profile, address: e.target.value })
                                    }
                                />
                            </label>
                        </>
                    )}

                    {isDriver && (
                        <div className="driver-images">
                            <div className="image-field">
                                <label>
                                    Carta de Condução:
                                    {editing && (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "driverLicense")}
                                        />
                                    )}
                                </label>
                                {previewLicense && (
                                    <img src={previewLicense} alt="Carta" className="preview-img" />
                                )}
                            </div>

                            <div className="image-field">
                                <label>
                                    Seguro:
                                    {editing && (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "insurance")}
                                        />
                                    )}
                                </label>
                                {previewInsurance && (
                                    <img src={previewInsurance} alt="Seguro" className="preview-img" />
                                )}
                            </div>
                        </div>
                    )}

                    <label>
                        Email:
                        <input
                            type="email"
                            disabled={!editing}
                            value={profile?.email || ""}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                    </label>

                    <label>
                        Telefone:
                        <input
                            type="text"
                            disabled={!editing}
                            value={profile?.phoneNumber || ""}
                            onChange={(e) =>
                                setProfile({ ...profile, phoneNumber: e.target.value })
                            }
                        />
                    </label>

                    <label>
                        NIF:
                        <input
                            type="text"
                            disabled={!editing}
                            value={profile?.nif || ""}
                            onChange={(e) => setProfile({ ...profile, nif: e.target.value })}
                        />
                    </label>
                </div>

                {editing && (
                    <div className="profile-actions">
                        <div className="left-actions">
                            <button onClick={handleSave} className="primary">
                                💾 Guardar Alterações
                            </button>
                            <button
                                className="secondary"
                                onClick={() => {
                                    setEditing(false);
                                    setMessage({ type: "info", text: "Edição cancelada." });
                                }}
                            >
                                ❌ Cancelar
                            </button>
                        </div>
                        <button className="danger" onClick={handleDeactivate}>
                            Desativar Conta
                        </button>
                    </div>
                )}

                {/* botão da palavra-passe no fundo */}
                <div className="bottom-password">
                    <button className="password-btn" onClick={() => setShowPasswordModal(true)}>
                        🔒 Alterar Palavra-passe
                    </button>
                </div>
            </div>

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
                            onChange={(e) =>
                                setPasswords({ ...passwords, confirm: e.target.value })
                            }
                        />
                        <div className="modal-actions">
                            <button onClick={handlePasswordChange}>Guardar</button>
                            <button className="danger" onClick={() => setShowPasswordModal(false)}>
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
