import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./ImageUpload.css";

const ImageUpload = ({ onImageChange, className = "" }) => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      if (onImageChange) {
        onImageChange(file);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <div
        className={`image-upload-area ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("image-input").click()}
      >
        {imagePreview ? (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">🖼️</div>
            <p>{t("new-work.uploadimage")}</p>
            <p className="upload-hint">{t("new-work.dragdropimage")}</p>
          </div>
        )}
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
