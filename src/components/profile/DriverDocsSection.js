import React from "react";
import "./DriverDocsSection.css";

// Upload/preview de documentos do motorista
function DriverDocsSection({
  editing,
  previewLicense,
  previewInsurance,
  onFileChange,
}) {
  return (
    <div className="driver-block">
      <div className="upload-tile">
        <span className="tile-label">Driver’s License</span>
        {editing && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e, "driverLicense")}
          />
        )}
        {previewLicense && <img src={previewLicense} alt="Driver License" />}
      </div>

      <div className="upload-tile">
        <span className="tile-label">Insurance</span>
        {editing && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e, "insurance")}
          />
        )}
        {previewInsurance && <img src={previewInsurance} alt="Insurance" />}
      </div>
    </div>
  );
}

export default DriverDocsSection;
