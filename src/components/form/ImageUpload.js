/**
 * @typedef {Object} ImageUploadProps
 * @property {File|null} [file] - Currently selected image file.
 * @property {function(Event): void} onChange - Change handler for the file input.
 */

import React from "react";
import "./ImageUpload.css";


/**
 * Drop-zone style image upload input.
 *
 * It renders a stylized file input and shows the selected file name
 * when a file has been chosen.
 *
 * @param {ImageUploadProps} props - Image file and change handler.
 * @returns {JSX.Element} Rendered image upload control.
 */
export default function ImageUpload({ file, onChange }) {
  return (
    <div className="drop-zone-wrapper">
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={onChange}
      />
      <label htmlFor="image-upload" className="drop-zone">
        <svg
          className="upload-icon"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="3"
            width="20"
            height="18"
            rx="2"
            stroke="#7a8fa6"
            strokeWidth="2"
          />
          <path
            d="M3 16l5-5 3 3 4-4 6 6"
            stroke="#7a8fa6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16.5" cy="7.5" r="1.5" fill="#7a8fa6" />
        </svg>
        <p className="drop-title">Upload Image</p>
        <span className="drop-instruction">Drag & drop or click to select</span>
      </label>
      {file && <p className="file-name">{file.name}</p>}
    </div>
  );
}
