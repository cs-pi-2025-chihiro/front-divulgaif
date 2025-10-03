import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(ENDPOINTS.STORAGE.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw error;
    }
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      `Erro ao fazer upload da imagem: ${error.message}`
    );
  }
};