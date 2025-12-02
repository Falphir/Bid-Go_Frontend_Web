import React from "react";
import "./ImageUpload.css";

// Upload de imagem
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
