import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const searchLabels = async (searchTerm = "", page = 0, size = 20) => {
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
    throw new Error(err.response?.data?.message || "Erro ao buscar labels");
  }
};

export const createLabel = async (labelData) => {
  try {
    const response = await api.post(ENDPOINTS.LABELS.CREATE, labelData);
    return response.data;
  } catch (err) {
    console.error("Erro ao criar label:", err);
    throw new Error(err.response?.data?.message || "Erro ao criar label");
  }
};
