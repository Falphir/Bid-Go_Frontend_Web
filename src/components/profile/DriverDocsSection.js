import React from "react";

function DriverDocsSection({ editing, previewLicense, previewInsurance, onFileChange }) {
  return (
    <div className="driver-block">
      <div className="upload-tile">
        <span className="tile-label">Carta de Condução</span>
        {editing && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e, "driverLicense")}
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
            onChange={(e) => onFileChange(e, "insurance")}
          />
        )}
        {previewInsurance && <img src={previewInsurance} alt="Seguro" />}
      </div>
    </div>
  );
}

export default DriverDocsSection;
