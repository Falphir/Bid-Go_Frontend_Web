import React from "react";
import PasswordInput from "../PasswordInput";

function CompanyRegisterForm({
  values,
  error,
  loading,
  onChange,
  onSubmit,
  onCancel
}) {
  const { name, companyName, address, email, password, phone, nif } = values;
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label className="login-label">
        Nome
        <input placeholder="Nome" value={name} onChange={(e) => onChange("name", e.target.value)} />
      </label>
      <label className="login-label">
        Company Name
        <input placeholder="Company Name" value={companyName} onChange={(e) => onChange("companyName", e.target.value)} />
      </label>
      <label className="login-label">
        Morada
        <input placeholder="Morada" value={address} onChange={(e) => onChange("address", e.target.value)} />
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
export default CompanyRegisterForm;
