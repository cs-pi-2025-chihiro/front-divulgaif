import { useState } from "react";
import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const useAuthors = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAuthors = async (searchTerm = "", page = 0, size = 20) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("name.startswith", searchTerm);
      }
      params.append("page", page);
      params.append("size", size);

      const response = await api.get(
        `${ENDPOINTS.AUTHORS.SEARCH}?${params.toString()}`
      );

      return {
        content: response.data.content || [],
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      };
    } catch (err) {
      console.error("Erro ao buscar autores:", err);
      setError(err.response?.data?.message || "Erro ao buscar autores");
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  const createAuthor = async (authorData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(ENDPOINTS.AUTHORS.CREATE, authorData);
      return response.data;
    } catch (err) {
      console.error("Erro ao criar autor:", err);
      setError(err.response?.data?.message || "Erro ao criar autor");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchAuthors,
    createAuthor,
  };
};
