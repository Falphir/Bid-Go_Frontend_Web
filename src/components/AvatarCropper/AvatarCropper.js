/**
 * @typedef {Object} AvatarCropperProps
 * @property {string} image - Source URL or data URL of the image to crop.
 * @property {function(): void} onCancel - Callback invoked when the user cancels cropping.
 * @property {function(File): void} onSave - Callback invoked with the cropped avatar file.
 */

import React, { useState } from "react";
import Cropper from "react-easy-crop";
import "./AvatarCropper.css";
import Button from "../Button/Button";

/**
 * Modal-like avatar cropper using `react-easy-crop`.
 *
 * It lets the user adjust crop and zoom over the provided image and,
 * when saved, returns a JPEG `File` containing only the selected area.
 *
 * @param {AvatarCropperProps} props - Cropper configuration and callbacks.
 * @returns {JSX.Element} Rendered avatar cropper overlay.
 */
function AvatarCropper({ image, onCancel, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });

  const getCroppedImg = async () => {
    const imageObj = await createImage(image);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedArea.width;
    canvas.height = croppedArea.height;

    ctx.drawImage(
      imageObj,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      croppedArea.width,
      croppedArea.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-modal">
        <div className="reactEasyCrop_Container">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="cropper-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={async () => {
              const croppedFile = await getCroppedImg();
              onSave(croppedFile);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AvatarCropper;
