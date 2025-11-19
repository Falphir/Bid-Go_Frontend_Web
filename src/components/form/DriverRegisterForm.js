import React from "react";
import PasswordInput from "../PasswordInput/PasswordInput";
import "./DriverRegisterForm.css";

function DriverRegisterForm({
  values,
  error,
  loading,
  onChange,
  onSubmit,
  onCancel
}) {
  const { name, email, password, phone, nif } = values;
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label className="login-label">
        Nome
        <input placeholder="Nome" value={name} onChange={(e) => onChange("name", e.target.value)} />
      </label>
      <label className="login-label">
        Carta de Condução (imagem)
        <input type="file" accept="image/*" onChange={(e) => onChange("driverLicense", e.target.files[0])} />
      </label>
      <label className="login-label">
        Seguro (imagem)
        <input type="file" accept="image/*" onChange={(e) => onChange("insurance", e.target.files[0])} />
      </label>
      <label className="login-label">
        Email
        <input type="email" placeholder="Email" value={email} onChange={(e) => onChange("email", e.target.value)} />
      </label>
      <PasswordInput label="Palavra-passe" value={password} onChange={(e) => onChange("password", e.target.value)} />
      <label className="login-label">
        Telefone
        <input placeholder="Telefone" value={phone} onChange={(e) => onChange("phone", e.target.value)} />
      </label>
      <label className="login-label">
        NIF
        <input placeholder="NIF" value={nif} onChange={(e) => onChange("nif", e.target.value)} />
      </label>
      {error && <p className="error-message">{error}</p>}
      <div className="form-actions">
        <button type="button" className="login-button" onClick={onSubmit} disabled={loading}>
          {loading ? 'A processar…' : 'Registar'}
        </button>
        <button type="button" className="login-button cancel" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
export default DriverRegisterForm;
