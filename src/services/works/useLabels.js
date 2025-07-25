import { useState } from "react";
import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const useLabels = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchLabels = async (searchTerm = "", page = 0, size = 20) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("name.like", searchTerm);
      }
      params.append("page", page);
      params.append("size", size);

      const response = await api.get(
        `${ENDPOINTS.LABELS.LIST}?${params.toString()}`
      );

      return {
        content: response.data.content || [],
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      };
    } catch (err) {
      console.error("Erro ao buscar labels:", err);
      setError(err.response?.data?.message || "Erro ao buscar labels");
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (labelData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(ENDPOINTS.LABELS.CREATE, labelData);
      return response.data;
    } catch (err) {
      console.error("Erro ao criar label:", err);
      setError(err.response?.data?.message || "Erro ao criar label");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchLabels,
    createLabel,
  };
};
