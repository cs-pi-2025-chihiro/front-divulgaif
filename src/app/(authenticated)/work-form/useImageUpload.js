import { useState } from "react";
import { uploadImage } from "../../../services/storage/uploadImage";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadImage(file);
      return imageUrl;
    } catch (error) {
      setUploadError(error.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleImageUpload,
    isUploading,
    uploadError,
  };
};