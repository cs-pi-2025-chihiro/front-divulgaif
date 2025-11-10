import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const searchLabels = async (searchTerm = "", page = 0, size = 20) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append("name", searchTerm);
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
      number: response.data.number || 0,
    };
  } catch (err) {
    console.error("Error fetching labels:", err);
    throw new Error(err.response?.data?.message || "Error fetching labels");
  }
};

export const createLabel = async (labelData) => {
  try {
    const payload = { 
      name: labelData.name,
      workId: labelData.workId || null
    };
    console.log("Creating label with payload:", payload);
    const response = await api.post(ENDPOINTS.LABELS.CREATE, payload);
    return response.data;
  } catch (err) {
    console.error("Error creating label:", err);
    console.error("Error response:", err.response?.data);
    throw new Error(err.response?.data?.message || "Error creating label");
  }
};

export const updateLabel = async (id, labelData) => {
  try {
    const payload = { name: labelData.name };
    console.log("Updating label with payload:", payload);
    const response = await api.put(ENDPOINTS.LABELS.UPDATE.replace('{id}', id), payload);
    return response.data;
  } catch (err) {
    console.error("Error updating label:", err);
    console.error("Error response:", err.response?.data);
    throw new Error(err.response?.data?.message || "Error updating label");
  }
};

export const deleteLabel = async (id) => {
  try {
    const response = await api.delete(ENDPOINTS.LABELS.DELETE.replace('{id}', id));
    return response.status === 204 || response.status === 200;
  } catch (err) {
    console.error("Error deleting label:", err);
    throw new Error(err.response?.data?.message || "Error deleting label");
  }
};