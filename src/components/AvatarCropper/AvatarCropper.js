import React, { useState } from "react";
import Cropper from "react-easy-crop";
import "./AvatarCropper.css";

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

  const handleSave = async () => {
    const file = await getCroppedImg();
    onSave(file);
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-modal">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />

        <div className="cropper-actions">
          <button className="btn danger" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn primary" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvatarCropper;
