import React from "react";
import { FiEdit2, FiCamera } from "react-icons/fi";
import "./AvatarSection.css";

function AvatarSection({
  profile,
  previewAvatar,
  editing,
  onStartEdit,
  onSelectAvatar,
}) {
  return (
    <div className="avatar-section">
      <div className="avatar-wrapper">
        <img
          src={
            previewAvatar ||
            (profile?.profileImage?.trim()
              ? profile.profileImage
              : "/Images/default-avatar.png")
          }
          alt="Foto de perfil"
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
              onChange={onSelectAvatar}
            />
          </>
        )}
      </div>
      <div className="header-text">
        <h2 className="card-title">{profile?.name}</h2>
        <p className="email-sub">{profile?.email}</p>
      </div>
      {!editing && (
        <button className="link-button" onClick={onStartEdit}>
          <FiEdit2 /> Editar Perfil
        </button>
      )}
    </div>
  );
}

export default AvatarSection;
