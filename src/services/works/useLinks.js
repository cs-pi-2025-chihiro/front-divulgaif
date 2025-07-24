import { useState } from "react";
import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const useLinks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchLinks = async (searchTerm = "", page = 0, size = 20) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("url.like", searchTerm);
      }
      params.append("page", page);
      params.append("size", size);

      const response = await api.get(
        `${ENDPOINTS.LINKS.LIST}?${params.toString()}`
      );

      return {
        content: response.data.content || [],
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      };
    } catch (err) {
      console.error("Erro ao buscar links:", err);
      setError(err.response?.data?.message || "Erro ao buscar links");
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (linkData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(ENDPOINTS.LINKS.CREATE, linkData);
      return response.data;
    } catch (err) {
      console.error("Erro ao criar link:", err);
      setError(err.response?.data?.message || "Erro ao criar link");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchLinks,
    createLink,
  };
};
