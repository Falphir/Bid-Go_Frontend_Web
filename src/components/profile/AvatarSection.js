/**
 * @typedef {Object} AvatarSectionProps
 * @property {Object|null} profile - Current profile object containing at least `name`, `email` and `profileImage`.
 * @property {string|null} [previewAvatar] - Data URL or URL of a temporary avatar preview.
 * @property {boolean} editing - Whether the profile is in editing mode.
 * @property {function(): void} onStartEdit - Callback to start avatar/profile editing.
 * @property {function(Event): void} onSelectAvatar - Change handler for the avatar file input.
 */

import React from "react";
import { FiEdit2, FiCamera } from "react-icons/fi";
import "./AvatarSection.css";
import defaultAvatar from "../../assets/person.png";


/**
 * Profile header section with avatar, basic user information and edit controls.
 *
 * @param {AvatarSectionProps} props - Profile data and avatar editing callbacks.
 * @returns {JSX.Element} Rendered avatar section.
 */
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
            (profile?.profileImage?.trim() ? profile.profileImage : defaultAvatar)
          }
          alt="Profile Avatar"
          className="avatar-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultAvatar;
          }}
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
          <FiEdit2 /> Edit Profile
        </button>
      )}
    </div>
  );
}

export default AvatarSection;
