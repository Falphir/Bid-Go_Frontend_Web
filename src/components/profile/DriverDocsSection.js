/**
 * @typedef {Object} DriverDocsSectionProps
 * @property {boolean} editing - Whether file inputs should be enabled.
 * @property {string|null} [previewLicense] - URL or data URL for the driver license preview.
 * @property {string|null} [previewInsurance] - URL or data URL for the insurance preview.
 * @property {function(Event, string): void} onFileChange - Callback for when any of the document inputs changes.
 */

import React from "react";
import "./DriverDocsSection.css";


/**
 * Section that handles upload and preview of driver documents
 * (driver’s license and insurance).
 *
 * @param {DriverDocsSectionProps} props - Editing flag, previews and file change handler.
 * @returns {JSX.Element} Rendered driver documents section.
 */
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
