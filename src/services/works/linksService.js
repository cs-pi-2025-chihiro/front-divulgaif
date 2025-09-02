import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const searchLinks = async (searchTerm = "", page = 0, size = 20) => {
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
    throw new Error(err.response?.data?.message || "Erro ao buscar links");
  }
};

export const createLink = async (linkData) => {
  try {
    const response = await api.post(ENDPOINTS.LINKS.CREATE, linkData);
    return response.data;
  } catch (err) {
    console.error("Erro ao criar link:", err);
    throw new Error(err.response?.data?.message || "Erro ao criar link");
  }
};
