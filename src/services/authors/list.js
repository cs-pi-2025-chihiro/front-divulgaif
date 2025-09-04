import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const searchAuthors = async (searchTerm = "", page = 0, size = 20) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append("name.like", searchTerm);
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
    console.error("Error fetching authors:", err);
    throw new Error(err.response?.data?.message || "Error fetching authors");
  }
};

export const createAuthor = async (authorData) => {
  try {
    const response = await api.post(ENDPOINTS.AUTHORS.CREATE, authorData);
    return response.data;
  } catch (err) {
    console.error("Error creating author:", err);
    throw new Error(err.response?.data?.message || "Error creating author");
  }
};
