import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const searchLinks = async (searchTerm = "", page = 0, size = 20) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append("title.like", searchTerm);
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
    console.error("Error fetching links:", err);
    throw new Error(err.response?.data?.message || "Error fetching links");
  }
};

export const createLink = async (linkData) => {
  try {
    const response = await api.post(ENDPOINTS.LINKS.CREATE, linkData);
    return response.data;
  } catch (err) {
    console.error("Error creating link:", err);
    throw new Error(err.response?.data?.message || "Error creating link");
  }
};

export const updateLink = async (linkId, linkData) => {
  try {
    const response = await api.put(
      `${ENDPOINTS.LINKS.UPDATE.replace("{id}", linkId)}`,
      linkData
    );
    return response.data;
  } catch (err) {
    console.error("Error updating link:", err);
    throw new Error(err.response?.data?.message || "Error updating link");
  }
};

export const deleteLink = async (linkId) => {
  try {
    await api.delete(`${ENDPOINTS.LINKS.DELETE.replace("{id}", linkId)}`);
  } catch (err) {
    console.error("Error deleting link:", err);
    throw new Error(err.response?.data?.message || "Error deleting link");
  }
};
